// 카테고리 버튼 클릭 시 사이드바 표시
window.addEventListener('DOMContentLoaded', function() {
  const categoryBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === '카테고리');
  const sidebar = document.getElementById('categorySidebar');
  const closeBtn = document.getElementById('categoryClose');
  if (categoryBtn) {
    categoryBtn.addEventListener('click', function(e) {
      e.preventDefault();
      sidebar.style.display = 'block';
    });
  }
  closeBtn.addEventListener('click', function() {
    sidebar.style.display = 'none';
  });
  // 바깥 클릭 시 닫기
  document.addEventListener('mousedown', function(e) {
    if (sidebar.style.display === 'block' && !sidebar.contains(e.target) && e.target !== categoryBtn) {
      sidebar.style.display = 'none';
    }
  });

  // 검색 버튼 클릭 시 모달 표시
  const searchBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'SEARCH');
  const modal = document.getElementById('searchModal');
  const searchCloseBtn = document.getElementById('searchClose');
  const submitBtn = document.getElementById('searchSubmit');
  const input = document.getElementById('searchInput');
  if (searchBtn) {
    searchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      modal.style.display = 'flex';
      input.focus();
    });
  }
  searchCloseBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.style.display = 'none';
  });
  submitBtn.addEventListener('click', function() {
    alert('검색어: ' + input.value);
    modal.style.display = 'none';
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      submitBtn.click();
    }
  });
});
import { db, auth, googleProvider } from './firebase.js';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';

async function logView() {
  const docRef = doc(db, 'abTest', 'variantA');
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    await updateDoc(docRef, { views: increment(1) });
  } else {
    await setDoc(docRef, { views: 1 });
  }
}

document.addEventListener('DOMContentLoaded', logView);

document.addEventListener('DOMContentLoaded', () => {
  // 네비게이션의 '로그인' 링크에 이벤트 연결
  const loginLinks = Array.from(document.querySelectorAll('a')).filter(a => a.textContent.trim() === '로그인');
  loginLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      if (link.textContent.trim() === '로그인') {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
          // Firestore에 사용자 정보 저장
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString()
          }, { merge: true });
          // 환영 메시지 표시
          alert(`환영합니다 ${user.displayName}`);
          // 로그인 버튼을 로그아웃으로 변경
          link.textContent = '로그아웃';
          // 1초가입 4000원 쿠폰 섹션 숨기기
          const couponBubble = document.querySelector('.coupon-bubble');
          if (couponBubble) couponBubble.style.display = 'none';
        } catch (error) {
          alert('로그인 실패: ' + error.message);
        }
      } else if (link.textContent.trim() === '로그아웃') {
        try {
          await signOut(auth);
          link.textContent = '로그인';
          alert('로그아웃 되었습니다.');
        } catch (error) {
          alert('로그아웃 실패: ' + error.message);
        }
      }
    });
  });
});

// SHOP/스포츠브라 버튼 클릭 시 카테고리 및 이미지 갤러리 표시
document.addEventListener('DOMContentLoaded', function() {
  const shopBtn = document.getElementById('shopNavBtn');
  const shopCategorySection = document.getElementById('shopCategorySection');
  const sportsBraBtn = document.getElementById('sportsBraBtn');
  const sportsBraGallery = document.getElementById('sportsBraGallery');
  if (shopBtn && shopCategorySection) {
    shopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      shopCategorySection.style.display = (shopCategorySection.style.display === 'none' || shopCategorySection.style.display === '') ? 'block' : 'none';
      shopCategorySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (sportsBraGallery) sportsBraGallery.style.display = 'none';
    });
  }
  if (sportsBraBtn && sportsBraGallery) {
    sportsBraBtn.addEventListener('click', function(e) {
      e.preventDefault();
      sportsBraGallery.style.display = (sportsBraGallery.style.display === 'none' || sportsBraGallery.style.display === '') ? 'block' : 'none';
    });
  }
});
