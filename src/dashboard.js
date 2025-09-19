import { db } from './firebase.js';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import Chart from 'chart.js/auto';
import { calculateChiSquared } from './statistics.js';

/**
 * Firestore에서 A/B 테스트 데이터를 가져옵니다.
 * @returns {Promise<Array>} A/B 테스트 결과 데이터 배열
 */
/**
 * Fetches and processes A/B test data for a given date range.
 * @param {string} startDate - Start date in 'YYYY-MM-DD' format.
 * @param {string} endDate - End date in 'YYYY-MM-DD' format.
 * @returns {Promise<{totalResults: Array, dailyStats: Array}>}
 */
async function getDashboardData(startDate, endDate) {
    const variants = ['A', 'B'];
    const dailyData = {}; // { 'YYYY-MM-DD': { viewsA: 10, clicksA: 1, ... }, ... }
    const totals = {
        variantA: { views: 0, clicks: 0 },
        variantB: { views: 0, clicks: 0 },
    };

    for (const variant of variants) {
        const dailyStatsCollection = collection(db, 'abTest', `variant${variant}`, 'dailyStats');
        // Create a query with date range
        const q = query(dailyStatsCollection, where(documentId(), '>=', startDate), where(documentId(), '<=', endDate));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(doc => {
            const date = doc.id;
            const data = doc.data();
            const views = data.views || 0;
            const clicks = data.clicks || 0;

            if (!dailyData[date]) {
                dailyData[date] = {};
            }
            dailyData[date][`views${variant}`] = views;
            dailyData[date][`clicks${variant}`] = clicks;

            // Add to totals
            totals[`variant${variant}`].views += views;
            totals[`variant${variant}`].clicks += clicks;
        });
    }
    
    // Format daily stats for charts
    const formattedDailyStats = Object.keys(dailyData)
        .sort()
        .map(date => ({
            date,
            ...dailyData[date]
        }));

    // Format total results for summary
    const formattedTotalResults = Object.keys(totals).map(variantId => {
        const { views, clicks } = totals[variantId];
        const conversionRate = views > 0 ? (clicks / views) * 100 : 0;
        return {
            id: variantId,
            views,
            clicks,
            conversionRate: conversionRate.toFixed(2)
        };
    });

    return { totalResults: formattedTotalResults, dailyStats: formattedDailyStats };
}

/**
 * 차트를 생성합니다.
 * @param {string} canvasId - 캔버스 요소의 ID
 * @param {string} chartType - 차트 유형 (e.g., 'bar', 'pie')
 * @param {Array<string>} labels - 차트 라벨 배열
 * @param {Array<Object>} datasets - 차트 데이터셋 배열
 * @param {Object} options - 차트 옵션
 */
function createChart(canvasId, chartType, labels, datasets, options = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: options
    });
}

/**
 * 요약 테이블을 렌더링합니다.
 * @param {Array} data - A/B 테스트 결과 데이터
 */
function renderSummaryTable(data) {
    const container = document.getElementById('summaryTable');
    if (!data || data.length === 0) {
        container.innerHTML = '<p>표시할 데이터가 없습니다.</p>';
        return;
    }

    // 승자 결정 (전환율 기준)
    const winner = data.reduce((prev, current) => (parseFloat(prev.conversionRate) > parseFloat(current.conversionRate)) ? prev : current);

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>항목</th>
                    <th>Variant A</th>
                    <th>Variant B</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>페이지 뷰 (Views)</td>
                    <td>${data.find(d => d.id === 'variantA')?.views || 0}</td>
                    <td>${data.find(d => d.id === 'variantB')?.views || 0}</td>
                </tr>
                <tr>
                    <td>CTA 클릭 (Clicks)</td>
                    <td>${data.find(d => d.id === 'variantA')?.clicks || 0}</td>
                    <td>${data.find(d => d.id === 'variantB')?.clicks || 0}</td>
                </tr>
                <tr>
                    <td>전환율 (CVR)</td>
                    <td class="${winner.id === 'variantA' ? 'winner' : ''}">${data.find(d => d.id === 'variantA')?.conversionRate || 0}%</td>
                    <td class="${winner.id === 'variantB' ? 'winner' : ''}">${data.find(d => d.id === 'variantB')?.conversionRate || 0}%</td>
                </tr>
            </tbody>
        </table>
    `;
    container.innerHTML = tableHTML;
}

/**
 * 통계적 유의성 결과를 렌더링합니다.
 * @param {object} sig - 유의성 분석 결과 객체
 */
function renderSignificance(sig) {
    const container = document.getElementById('significanceResult');
    let resultHTML = `<p class="analysis-message">${sig.message}</p>`;
    
    if (sig.pValue <= 0.05) {
        resultHTML += `<div class="confidence-level significant">신뢰 수준: <strong>${sig.confidence.toFixed(0)}%</strong> (p-value ≤ ${sig.pValue})</div>`;
    } else {
        // p-value가 0.1보다 크면 유의미하지 않다고 간주
        const pValueDisplay = getPValueForDisplay(sig.pValue);
        resultHTML += `<div class="confidence-level not-significant">신뢰 수준: <strong>${sig.confidence.toFixed(0)}%</strong> (p-value > ${pValueDisplay})</div>`;
    }
    container.innerHTML = resultHTML;
}

/**
 * 대시보드 초기화 함수
 */
async function initializeDashboard() {
    const endDateInput = document.getElementById('endDate');
    const startDateInput = document.getElementById('startDate');
    const applyBtn = document.getElementById('applyDateFilter');

    // Set default dates (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // including today, it's 7 days

    endDateInput.value = today.toISOString().split('T')[0];
    startDateInput.value = sevenDaysAgo.toISOString().split('T')[0];

    applyBtn.addEventListener('click', () => {
        updateDashboard(startDateInput.value, endDateInput.value);
    });

    // Initial load
    await updateDashboard(startDateInput.value, endDateInput.value);
}

/**
 * Renders the entire dashboard for a given date range.
 * @param {string} startDate 
 * @param {string} endDate 
 */
async function updateDashboard(startDate, endDate) {
    // Show loading state
    document.querySelector('main').style.opacity = '0.5';

    try {
        const { totalResults, dailyStats } = await getDashboardData(startDate, endDate);
        
        const labels = totalResults.map(r => r.id.replace('variant', 'Variant '));
        
        renderSummaryTable(totalResults);

        const variantA = totalResults.find(r => r.id === 'variantA') || { views: 0, clicks: 0 };
        const variantB = totalResults.find(r => r.id === 'variantB') || { views: 0, clicks: 0 };

        const significance = calculateChiSquared(variantA.views, variantA.clicks, variantB.views, variantB.clicks);
        renderSignificance(significance);

        // Clear previous charts before drawing new ones
        document.getElementById('dailyViewsChart').parentElement.innerHTML = '<canvas id="dailyViewsChart"></canvas>';
        document.getElementById('dailyCvrChart').parentElement.innerHTML = '<canvas id="dailyCvrChart"></canvas>';
        document.getElementById('conversionRateChart').parentElement.innerHTML = '<canvas id="conversionRateChart"></canvas>';
        document.getElementById('viewsChart').parentElement.innerHTML = '<canvas id="viewsChart"></canvas>';

        if (dailyStats.length > 0) {
            const dailyLabels = dailyStats.map(d => d.date);

            // 일자별 페이지 뷰 차트
            createChart('dailyViewsChart', 'line', dailyLabels, [
                {
                    label: 'Variant A Views',
                    data: dailyStats.map(d => d.viewsA || 0),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'Variant B Views',
                    data: dailyStats.map(d => d.viewsB || 0),
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    fill: true,
                    tension: 0.1
                }
            ]);

            // 일자별 전환율 차트
            createChart('dailyCvrChart', 'line', dailyLabels, [
                {
                    label: 'Variant A CVR (%)',
                    data: dailyStats.map(d => (d.viewsA > 0 ? (d.clicksA || 0) / d.viewsA * 100 : 0)),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    tension: 0.1
                },
                {
                    label: 'Variant B CVR (%)',
                    data: dailyStats.map(d => (d.viewsB > 0 ? (d.clicksB || 0) / d.viewsB * 100 : 0)),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    tension: 0.1
                }
            ], { scales: { y: { beginAtZero: true, ticks: { callback: value => value.toFixed(1) + '%' } } } });
        }

        createChart('conversionRateChart', 'bar', labels, [{
            label: '전환율 (%)',
            data: totalResults.map(r => r.conversionRate),
            backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        }], { scales: { y: { beginAtZero: true, ticks: { callback: value => value + '%' } } }, plugins: { legend: { display: false } } });

        createChart('viewsChart', 'pie', labels, [{
            label: '페이지 뷰',
            data: totalResults.map(r => r.views),
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        }], { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } });

    } catch (error) {
        console.error("대시보드 로딩 중 오류 발생:", error);
        document.querySelector('main').innerHTML = '<p>데이터를 불러오는 데 실패했습니다. 콘솔을 확인해주세요.</p>';
    } finally {
        // Remove loading state
        document.querySelector('main').style.opacity = '1';
    }
}

function getPValueForDisplay(pValue) {
    if (pValue > 0.1) return '0.10';
    if (pValue > 0.05) return '0.05';
    if (pValue > 0.02) return '0.02';
    if (pValue > 0.01) return '0.01';
    return '0.001';
}

document.addEventListener('DOMContentLoaded', initializeDashboard);