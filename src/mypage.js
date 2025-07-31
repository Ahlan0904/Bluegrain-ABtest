import { db, auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// 사용자 정보 표시
function showUserProfile(user) {
  const profile = document.getElementById('userProfile');
  profile.innerHTML = `
    <img src="${user.photoURL}" alt="프로필" style="width:60px;height:60px;border-radius:50%;">
    <div><strong>${user.displayName}</strong></div>
    <div>${user.email}</div>
  `;
}

// 구매내역, 쿠폰, 적립금 표시
async function showUserData(uid) {
  // Firestore에서 데이터 가져오기 (예시 구조)
  const userDoc = await getDoc(doc(db, 'users', uid));
  const data = userDoc.exists() ? userDoc.data() : {};

  // 구매내역
  const purchaseList = document.getElementById('purchaseList');
  purchaseList.innerHTML = '';
  if (data.purchases && data.purchases.length > 0) {
    data.purchases.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.date} - ${item.product} (${item.price}원)`;
      purchaseList.appendChild(li);
    });
  } else {
    purchaseList.innerHTML = '<li>구매내역이 없습니다.</li>';
  }

  // 쿠폰
  const couponList = document.getElementById('couponList');
  couponList.innerHTML = '';
  if (data.coupons && data.coupons.length > 0) {
    data.coupons.forEach(coupon => {
      const li = document.createElement('li');
      li.textContent = `${coupon.name} (${coupon.expiry})`;
      couponList.appendChild(li);
    });
  } else {
    couponList.innerHTML = '<li>쿠폰이 없습니다.</li>';
  }

  // 적립금
  const points = document.getElementById('points');
  points.textContent = (data.points || 0) + '원';
}

// 로그인 상태 확인 및 데이터 표시
onAuthStateChanged(auth, user => {
  if (user) {
    showUserProfile(user);
    showUserData(user.uid);
  } else {
    document.getElementById('userProfile').innerHTML = '<div>로그인 후 이용 가능합니다.</div>';
    document.getElementById('purchaseList').innerHTML = '<li>구매내역이 없습니다.</li>';
    document.getElementById('couponList').innerHTML = '<li>쿠폰이 없습니다.</li>';
    document.getElementById('points').textContent = '0원';
  }
});
