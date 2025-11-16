// Product Detail Page Functionality
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        await loadProductDetail(productId);
    } else {
        window.location.href = 'index.html';
    }
});

async function loadProductDetail(productId) {
    try {
        const response = await API.getProduct(productId);
        
        if (response.success && response.data.length > 0) {
            const product = response.data[0];
            displayProductDetail(product);
            loadRelatedProducts(product);
        } else {
            showProductNotFound();
        }
    } catch (error) {
        console.error('Error loading product detail:', error);
        showProductNotFound();
    }
}

function displayProductDetail(product) {
    const container = document.getElementById('productDetailContainer');
    
    if (!container) return;

    // Update breadcrumb
    const breadcrumb = document.getElementById('productCategoryBreadcrumb');
    if (breadcrumb) {
        breadcrumb.textContent = product.title;
    }

    // Generate product HTML
    const productHTML = `
        <div class="product-gallery">
            <div class="main-image">
                ${product.images && product.images.length > 0 ? 
                    `<img src="${product.images[0]}" alt="${product.title}">` :
                    `<i class="${product.icon}" style="font-size: 5rem; color: var(--primary);"></i>`
                }
            </div>
        </div>
        <div class="product-info-detail">
            <div class="product-category-detail">${product.sub_category}</div>
            <h1 class="product-title-detail">${product.title}</h1>
            <div class="product-price-detail">$${product.price.toFixed(2)}</div>
            <div class="product-description-detail">
                ${product.description}
            </div>
            
            ${product.features && product.features.length > 0 ? `
                <div class="product-features">
                    <h4>Features</h4>
                    <ul>
                        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="product-actions-detail">
                <div class="action-buttons ${product.has_live_demo ? 'with-live-demo' : 'without-live-demo'}">
                    ${product.has_live_demo ? `
                        <a href="${product.live_demo_url}" class="live-demo-btn" target="_blank">
                            <i class="fas fa-play-circle"></i> Live Demo
                        </a>
                    ` : ''}
                    <button class="btn add-to-cart-detail" 
                            data-id="${product.id}" 
                            data-title="${product.title}" 
                            data-price="${product.price}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="proceed-checkout-btn" onclick="proceedToCheckout()">
                        <i class="fas fa-credit-card"></i> Checkout
                    </button>
                </div>
            </div>
            
            <div class="product-meta">
                <div class="meta-item">
                    <span class="meta-label">Category:</span>
                    <span class="meta-value">${product.sub_category}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Product Type:</span>
                    <span class="meta-value">${formatProductType(product.main_category)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Live Demo:</span>
                    <span class="meta-value">${product.has_live_demo ? 'Available' : 'Not Available'}</span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = productHTML;

    // Add event listeners
    const addToCartBtn = container.querySelector('.add-to-cart-detail');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

function formatProductType(type) {
    const types = {
        'html-css-js': 'HTML/CSS/JS',
        'python': 'Python',
        'open-source': 'Open Source'
    };
    return types[type] || type;
}

function showProductNotFound() {
    const container = document.getElementById('productDetailContainer');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                <h2>Product Not Found</h2>
                <p>The product you're looking for doesn't exist or has been removed.</p>
                <a href="index.html" class="btn">Back to Store</a>
            </div>
        `;
    }
}

async function loadRelatedProducts(product) {
    try {
        const response = await API.getProducts(product.main_category);
        
        if (response.success) {
            // Filter out current product and get 4 related products
            const related = response.data
                .filter(p => p.id !== product.id)
                .slice(0, 4);
            
            displayRelatedProducts(related);
        }
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

function displayRelatedProducts(products) {
    const container = document.getElementById('relatedProducts');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--gray);">No related products found.</p>';
        return;
    }

    container.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = createProductCardHTML(product);
        container.appendChild(productCard);
    });

    // Re-attach event listeners
    container.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });
}

function createProductCardHTML(product) {
    const imageHTML = product.images && product.images.length > 0 ? 
        `<img src="${product.images[0]}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
        `<i class="${product.icon}"></i>`;

    const liveDemoBadge = product.has_live_demo ? 
        '<span class="live-demo-indicator"><i class="fas fa-play-circle"></i> Live Demo</span>' : '';

    return `
        <div class="product-image">
            ${imageHTML}
        </div>
        <div class="product-info">
            <div class="product-category">${product.sub_category}</div>
            <h3 class="product-title">${product.title} ${liveDemoBadge}</h3>
            <p class="product-description">${product.description.substring(0, 100)}...</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn add-to-cart" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}">
                    Add to Cart
                </button>
                <a href="product-detail.html?id=${product.id}" class="btn" style="background-color: var(--gray); text-decoration: none;">
                    View Details
                </a>
            </div>
        </div>
    `;
}