import { db, auth, googleProvider } from './firebase.js';
import { doc, setDoc, increment, writeBatch } from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';

import { updateCartIcon } from './cart-logic.js';

/**
 * 페이지 뷰 또는 클릭과 같은 이벤트를 Firestore에 기록합니다.
 * @param {string} eventType - 이벤트 유형 (e.g., 'view', 'click')
 * @param {string} variant - A/B 테스트 변형 (e.g., 'A', 'B')
 */
export async function logEvent(eventType, variant) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const variantDocRef = doc(db, 'abTest', `variant${variant}`);
    const dailyStatDocRef = doc(db, 'abTest', `variant${variant}`, 'dailyStats', today);

    const batch = writeBatch(db);

    // 전체 카운트 업데이트
    batch.set(variantDocRef, { [eventType]: increment(1) }, { merge: true });

    // 일자별 카운트 업데이트
    batch.set(dailyStatDocRef, { [eventType]: increment(1) }, { merge: true });

    await batch.commit();
  } catch (error) {
    console.error("Error logging event:", error);
  }
}

/**
 * Google 계정으로 로그인/로그아웃을 처리합니다.
 */
async function handleAuth() {
  const loginButtons = document.querySelectorAll('.login-btn');
  
  loginButtons.forEach(button => {
    if (button.textContent.trim() === '로그인') {
      signInWithPopup(auth, googleProvider)
        .then(result => {
          const user = result.user;
          const userRef = doc(db, 'users', user.uid);
          setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString()
          }, { merge: true });
          alert(`환영합니다 ${user.displayName}님!`);
          updateUIOnLogin(user.displayName);
        })
        .catch(error => alert('로그인 실패: ' + error.message));
    } else {
      signOut(auth)
        .then(() => {
          alert('로그아웃 되었습니다.');
          updateUIOnLogout();
        })
        .catch(error => alert('로그아웃 실패: ' + error.message));
    }
  });
}

function updateUIOnLogin(displayName) {
  document.querySelectorAll('.login-btn').forEach(btn => btn.textContent = '로그아웃');
  const couponBubble = document.querySelector('.coupon-bubble');
  if (couponBubble) couponBubble.style.display = 'none';
  updateCartIcon();
}

function updateUIOnLogout() {
  document.querySelectorAll('.login-btn').forEach(btn => btn.textContent = '로그인');
  const couponBubble = document.querySelector('.coupon-bubble');
  if (couponBubble) couponBubble.style.display = 'block';
  updateCartIcon();
}

/**
 * 공통 UI 요소(사이드바, 모달 등)에 대한 이벤트 리스너를 설정합니다.
 */
export function initializeCommonUI() {
  // 페이지 로드 시 장바구니 아이콘 업데이트
  updateCartIcon();

  // 카테고리 사이드바
  const categoryBtn = document.getElementById('categoryBtn');
  const sidebar = document.getElementById('categorySidebar');
  const closeBtn = document.getElementById('categoryClose');

  if (categoryBtn && sidebar && closeBtn) {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    const toggleSidebar = (e) => {
      e.preventDefault();
      sidebar.classList.toggle('is-visible');
      overlay.classList.toggle('is-visible');
    };

    categoryBtn.addEventListener('click', toggleSidebar);
    closeBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
  }
  
  // 검색 모달
  const searchBtn = document.getElementById('searchBtn');
  const modal = document.getElementById('searchModal');
  const searchCloseBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');

  searchBtn?.addEventListener('click', (e) => { e.preventDefault(); modal.style.display = 'flex'; input.focus(); });
  searchCloseBtn?.addEventListener('click', () => { modal.style.display = 'none'; });
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

  // 로그인/로그아웃
  document.querySelectorAll('.login-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      handleAuth();
    });
  });
}

document.addEventListener('DOMContentLoaded', initializeCommonUI);