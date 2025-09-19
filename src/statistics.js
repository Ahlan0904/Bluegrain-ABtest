/**
 * 카이제곱 값으로부터 p-value를 근사 계산합니다. (자유도 1)
 * 실제 서비스에서는 전문 통계 라이브러리 사용을 권장합니다.
 * @param {number} chi2 - 카이제곱 통계량
 * @returns {number} p-value
 */
function getPValue(chi2) {
    if (chi2 >= 10.83) return 0.001;
    if (chi2 >= 6.63) return 0.01;
    if (chi2 >= 5.41) return 0.02;
    if (chi2 >= 3.84) return 0.05;
    if (chi2 >= 2.71) return 0.10;
    return 1.0; // 유의미하지 않음
}

/**
 * 두 그룹 간의 전환율 차이에 대한 카이제곱 검정을 수행합니다.
 * @param {number} visitorsA - A안 방문자 수
 * @param {number} conversionsA - A안 전환 수
 * @param {number} visitorsB - B안 방문자 수
 * @param {number} conversionsB - B안 전환 수
 * @returns {object} p-value, 신뢰도, 분석 메시지를 포함한 객체
 */
export function calculateChiSquared(visitorsA, conversionsA, visitorsB, conversionsB) {
    const totalVisitors = visitorsA + visitorsB;
    const totalConversions = conversionsA + conversionsB;

    if (totalVisitors === 0 || visitorsA === 0 || visitorsB === 0 || totalConversions === 0) {
        return { pValue: 1, confidence: 0, message: "데이터가 부족하여 유의성을 계산할 수 없습니다." };
    }

    // 각 셀의 기대값 계산
    const expectedConvA = (visitorsA * totalConversions) / totalVisitors;
    const expectedNonConvA = visitorsA - expectedConvA;
    const expectedConvB = (visitorsB * totalConversions) / totalVisitors;
    const expectedNonConvB = visitorsB - expectedConvB;

    // 카이제곱 통계량 계산
    const chi2 = 
        Math.pow(conversionsA - expectedConvA, 2) / expectedConvA +
        Math.pow((visitorsA - conversionsA) - expectedNonConvA, 2) / expectedNonConvA +
        Math.pow(conversionsB - expectedConvB, 2) / expectedConvB +
        Math.pow((visitorsB - conversionsB) - expectedNonConvB, 2) / expectedNonConvB;

    const pValue = getPValue(chi2);
    const confidence = (1 - pValue) * 100;

    let message;
    if (pValue <= 0.05) {
        const crA = (conversionsA / visitorsA);
        const crB = (conversionsB / visitorsB);
        const winner = crB > crA ? 'B' : 'A';
        message = `결과가 통계적으로 유의미합니다. 현재 데이터에 따르면, Variant ${winner}가 더 우수한 성과를 보이고 있습니다.`;
    } else {
        message = "두 버전 간의 차이가 통계적으로 유의미하지 않습니다. 우연에 의한 결과일 수 있으므로, 더 많은 데이터를 수집하거나 테스트를 재설계하는 것을 고려해 보세요.";
    }

    return { pValue, confidence, message };
}