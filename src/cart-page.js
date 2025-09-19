import { getCartItems, updateQuantity, removeFromCart, updateCartIcon } from './cart-logic.js';

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 3000;

function renderCart() {
    const cart = getCartItems();
    const container = document.getElementById('cartItemsContainer');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-message">장바구니에 담긴 상품이 없습니다.</p>';
        updateSummary(0);
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <span class="item-name">${item.name}</span>
                <div class="item-quantity-controls">
                    <button class="quantity-btn" data-action="decrease">-</button>
                    <input type="number" class="item-quantity" value="${item.quantity}" min="1">
                    <button class="quantity-btn" data-action="increase">+</button>
                </div>
            </div>
            <div class="item-price-section">
                <span class="item-price">${(item.price * item.quantity).toLocaleString()}원</span>
                <button class="remove-item-btn">삭제</button>
            </div>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    updateSummary(subtotal);
    addEventListeners();
}

function updateSummary(subtotal) {
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    document.getElementById('subtotalPrice').textContent = `${subtotal.toLocaleString()}원`;
    document.getElementById('shippingFee').textContent = `${shipping.toLocaleString()}원`;
    document.getElementById('totalPrice').textContent = `${total.toLocaleString()}원`;

    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.disabled = total === 0;
}

async function handleQuantityChange(productId, newQuantity) {
    await updateQuantity(productId, parseInt(newQuantity, 10));
    updateCartIcon();
    renderCart(); // Re-render to update prices
}

function addEventListeners() {
    const container = document.getElementById('cartItemsContainer');
    container.addEventListener('click', async (e) => {
        const target = e.target;
        const itemElement = target.closest('.cart-item');
        if (!itemElement) return;

        const productId = itemElement.dataset.id;

        if (target.classList.contains('remove-item-btn')) {
            if (confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) {
                await removeFromCart(productId);
                updateCartIcon();
                renderCart();
            }
        }

        if (target.classList.contains('quantity-btn')) {
            const input = itemElement.querySelector('.item-quantity');
            let quantity = parseInt(input.value, 10);
            if (target.dataset.action === 'increase') {
                quantity++;
            } else if (target.dataset.action === 'decrease' && quantity > 1) {
                quantity--;
            }
            input.value = quantity;
            await handleQuantityChange(productId, quantity);
        }
    });

    container.addEventListener('change', async (e) => {
        if (e.target.classList.contains('item-quantity')) {
            const itemElement = e.target.closest('.cart-item');
            const productId = itemElement.dataset.id;
            let quantity = parseInt(e.target.value, 10);
            if (quantity < 1) {
                quantity = 1;
                e.target.value = 1;
            }
            await handleQuantityChange(productId, quantity);
        }
    });
}

document.addEventListener('DOMContentLoaded', renderCart);