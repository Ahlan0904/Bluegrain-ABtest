import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in.
        displayUserProfile(user);
    } else {
        // User is signed out.
        alert('로그인이 필요한 페이지입니다.');
        window.location.href = '/index.html'; // Redirect to home
    }
});

function displayUserProfile(user) {
    const profileContainer = document.getElementById('userProfile');
    if (!profileContainer) return;

    profileContainer.innerHTML = `
        <img src="${user.photoURL || 'https://via.placeholder.com/80'}" alt="Profile Picture" class="profile-pic">
        <div class="profile-info">
            <h2>${user.displayName || '사용자'}님, 환영합니다!</h2>
            <p>${user.email}</p>
            <button id="logoutBtn" class="logout-btn">로그아웃</button>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        signOut(auth).catch((error) => {
            console.error('Logout Error:', error);
        });
    });
}