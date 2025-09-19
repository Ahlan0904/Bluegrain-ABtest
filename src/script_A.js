import { logEvent, initializeCommonUI } from './common.js';

/**
 * Variant A 페이지에만 해당하는 스크립트를 초기화합니다.
 */
function initializeVariantASpecific() {
    // SHOP 버튼 클릭 시 상품별 카테고리 섹션 표시
    const shopBtn = document.getElementById('shopNavBtn');
    const shopCategorySection = document.getElementById('shopCategorySection');
    if (shopBtn && shopCategorySection) {
        shopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // document 클릭 리스너가 바로 닫는 것을 방지

            // 'slide-in' 클래스를 토글하여 애니메이션 제어
            shopCategorySection.classList.toggle('slide-in');

            if (shopCategorySection.classList.contains('slide-in')) {
                shopCategorySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        // 드롭다운 외부를 클릭하면 닫히도록 설정
        document.addEventListener('click', function(e) {
            if (shopCategorySection.classList.contains('slide-in') && !shopCategorySection.contains(e.target) && e.target !== shopBtn) {
                shopCategorySection.classList.remove('slide-in');
            }
        });
    }

    // CTA 버튼 클릭 이벤트 로깅
    const ctaBtn = document.getElementById('ctaBtn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            logEvent('clicks', 'A');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. 공통 UI 초기화 (사이드바, 모달, 로그인 등)
    initializeCommonUI();

    // 2. 이 페이지의 뷰를 기록
    logEvent('view', 'A');

    // 3. Variant A 페이지에만 해당하는 스크립트 초기화
    initializeVariantASpecific();
});
