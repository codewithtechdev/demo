// Enhanced Cart functionality for Netlify
let cart = [];

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCart();
        }
    } catch (error) {
        console.error('Error loading cart from storage:', error);
        cart = [];
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to storage:', error);
    }
}

// Add to cart function
function addToCart(e) {
    const id = parseInt(e.target.getAttribute('data-id'));
    const title = e.target.getAttribute('data-title');
    const price = parseFloat(e.target.getAttribute('data-price'));

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            title,
            price,
            quantity: 1
        });
    }

    updateCart();
    saveCartToStorage();
    showCartNotification();
}

// Enhanced checkout function for Netlify
async function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // For demo purposes, use a mock email
    // In production, you'd collect this from a form
    const customerEmail = 'customer@example.com';

    const orderData = {
        customerEmail,
        items: cart
    };

    try {
        const response = await API.processPayment(orderData, 'verifone');

        if (response.success) {
            // Redirect to success page
            window.location.href = response.downloadUrl;
            
            // Clear cart
            cart = [];
            saveCartToStorage();
            updateCart();
        } else {
            alert('Payment failed: ' + response.error);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed. Please try again.');
    }
}

// Update cart display
function updateCart() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartCount || !cartItems || !cartTotal) return;

    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items in modal
    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--gray);">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                <button class="remove-item" data-id="${item.id}">&times;</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }

    // Update total
    cartTotal.textContent = `$${total.toFixed(2)}`;

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', removeFromCart);
    });
}

// Remove from cart
function removeFromCart(e) {
    const id = parseInt(e.target.getAttribute('data-id'));
    cart = cart.filter(item => item.id !== id);
    updateCart();
    saveCartToStorage();
}

// Show cart notification
function showCartNotification() {
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 300);
    }
}

// Initialize cart functionality
function initCart() {
    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const checkoutBtn = document.querySelector('.checkout-btn');

    if (cartIcon && cartModal && closeCart) {
        cartIcon.addEventListener('click', () => {
            cartModal.style.display = 'flex';
        });

        closeCart.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });
    }

    // Setup checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }

    // Load cart from storage
    loadCartFromStorage();
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.proceedToCheckout = proceedToCheckout;
window.initCart = initCart;

async function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const customerEmail = prompt('Please enter your email for order confirmation:');
    if (!customerEmail) {
        alert('Email is required for order processing.');
        return;
    }

    const orderData = {
        customerEmail,
        items: cart
    };

    try {
        const response = await API.processPayment(orderData, 'verifone');

        if (response.success) {
            // Store order in localStorage for download page
            localStorage.setItem('lastOrder', JSON.stringify({
                orderId: response.orderId,
                items: cart,
                timestamp: Date.now()
            }));
            
            // Redirect to download page
            window.location.href = response.downloadUrl;
            
            // Clear cart after successful payment
            cart = [];
            saveCartToStorage();
            updateCart();
        } else {
            alert('Payment failed: ' + response.error);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed. Please try again.');
    }
}