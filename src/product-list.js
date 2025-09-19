import { addToCart } from './cart-logic.js';

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');

    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const card = e.target.closest('.product-card');
                const product = {
                    id: card.dataset.id,
                    name: card.dataset.name,
                    price: parseInt(card.dataset.price, 10),
                    image: card.dataset.image
                };
                addToCart(product);
            }
        });
    }
});