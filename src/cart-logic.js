import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LOCAL_CART_KEY = 'bluegrain_cart';

let currentUser = null;
let cartCache = [];

/**
 * localStorage에서 장바구니 데이터를 가져옵니다.
 * @returns {Array} 장바구니 아이템 배열
 */
export function getCartItems() {
    if (currentUser) {
        return cartCache;
    }
    return JSON.parse(localStorage.getItem(LOCAL_CART_KEY)) || [];
}

/**
 * 장바구니 데이터를 localStorage에 저장합니다.
 * @param {Array} cart - 저장할 장바구니 배열
 */
async function saveCart(cart) {
    if (currentUser) {
        cartCache = cart;
        await setDoc(doc(db, 'users', currentUser.uid), { cart }, { merge: true });
    } else {
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    }
}

/**
 * 상품을 장바구니에 추가합니다. 이미 있는 상품이면 수량을 1 증가시킵니다.
 * @param {object} product - 추가할 상품 객체 (id, name, price, image 필수)
 */
export async function addToCart(product) {
    const cart = getCartItems();
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    await saveCart(cart);
    updateCartIcon();
    alert(`'${product.name}' 상품이 장바구니에 담겼습니다.`);
}

/**
 * 헤더의 장바구니 아이콘 숫자를 업데이트합니다.
 */
export function updateCartIcon() {
    const cart = getCartItems();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartLinks = document.querySelectorAll('.cart-link');
    cartLinks.forEach(link => {
        if (link) {
            link.textContent = `장바구니(${totalItems})`;
        }
    });
}

/**
 * 장바구니에서 상품을 제거합니다.
 * @param {string} productId - 제거할 상품의 ID
 */
export async function removeFromCart(productId) {
    let cart = getCartItems();
    cart = cart.filter(item => item.id !== productId);
    await saveCart(cart);
}

/**
 * 장바구니 상품의 수량을 업데이트합니다.
 * @param {string} productId - 업데이트할 상품의 ID
 * @param {number} quantity - 새로운 수량
 */
export async function updateQuantity(productId, quantity) {
    const cart = getCartItems();
    const productIndex = cart.findIndex(item => item.id === productId);
    if (productIndex > -1) {
        if (quantity > 0) {
            cart[productIndex].quantity = quantity;
        } else {
            cart.splice(productIndex, 1); // 수량이 0 이하면 삭제
        }
    }
    await saveCart(cart);
}

async function fetchFirestoreCart() {
    if (!currentUser) {
        cartCache = [];
        return;
    }
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    cartCache = userDoc.exists() && userDoc.data().cart ? userDoc.data().cart : [];
    updateCartIcon();
}

async function mergeLocalCartToFirestore() {
    const localCart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY)) || [];
    if (localCart.length === 0 || !currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    const firestoreCart = userDocSnap.exists() && userDocSnap.data().cart ? userDocSnap.data().cart : [];

    localCart.forEach(localItem => {
        const existingIndex = firestoreCart.findIndex(item => item.id === localItem.id);
        if (existingIndex > -1) {
            firestoreCart[existingIndex].quantity += localItem.quantity;
        } else {
            firestoreCart.push(localItem);
        }
    });

    await setDoc(userDocRef, { cart: firestoreCart }, { merge: true });
    localStorage.removeItem(LOCAL_CART_KEY);
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await mergeLocalCartToFirestore();
        await fetchFirestoreCart();
    } else {
        currentUser = null;
        cartCache = []; // Clear cache on logout
    }
    updateCartIcon();
});