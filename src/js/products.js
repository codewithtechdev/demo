// Real-time product management with Neon database
let currentProducts = [];

// Load products from Neon database
async function loadProductsFromDatabase() {
  try {
    console.log('🔄 Loading products from Neon database...');
    
    // Check if API is available
    if (typeof window.API === 'undefined') {
      console.error('❌ API not loaded - using localStorage fallback');
      return loadProductsFromStorage();
    }
    
    const response = await window.API.getProducts();
    
    if (response && response.success) {
      currentProducts = response.data;
      console.log(`✅ Loaded ${currentProducts.length} products from database`);
    } else {
      throw new Error('API response failed: ' + (response?.error || 'Unknown error'));
    }

    // Separate by category
    window.htmlProducts = currentProducts.filter(p => p.main_category === 'html-css-js');
    window.pythonProducts = currentProducts.filter(p => p.main_category === 'python');
    window.opensourceProducts = currentProducts.filter(p => p.main_category === 'open-source');

    // Update UI if on index page
    updateProductDisplays();
    
    // Initialize subcategory previews if function exists
    if (typeof initializeSubcategoryPreviews === 'function') {
      initializeSubcategoryPreviews();
    }

    return currentProducts;
  } catch (error) {
    console.error('❌ Failed to load products from database:', error);
    // Fallback to localStorage if database fails
    return loadProductsFromStorage();
  }
}

// Fallback to localStorage
function loadProductsFromStorage() {
  try {
    console.log('📦 Loading products from localStorage fallback...');
    const savedProducts = localStorage.getItem('neonProducts');
    
    if (savedProducts) {
      currentProducts = JSON.parse(savedProducts);
      
      // Separate by category
      window.htmlProducts = currentProducts.filter(p => p.main_category === 'html-css-js');
      window.pythonProducts = currentProducts.filter(p => p.main_category === 'python');
      window.opensourceProducts = currentProducts.filter(p => p.main_category === 'open-source');
      
      console.log(`✅ Loaded ${currentProducts.length} products from localStorage`);
      
      // Update UI
      updateProductDisplays();
      
      return currentProducts;
    } else {
      console.log('📭 No products found in localStorage');
      return [];
    }
  } catch (error) {
    console.error('❌ Error loading from localStorage:', error);
    return [];
  }
}

// Update all product displays
function updateProductDisplays() {
  if (document.getElementById('htmlProducts')) {
    displayProducts(window.htmlProducts, 'htmlProducts');
    displayProducts(window.pythonProducts, 'pythonProducts');
    displayProducts(window.opensourceProducts, 'opensourceProducts');
  }
}

// Initialize real-time updates
function setupRealTimeUpdates() {
  // Check if API has subscribe method
  if (typeof window.API === 'undefined' || typeof window.API.subscribeToProducts !== 'function') {
    console.log('⚠️ Real-time updates not available');
    return;
  }
  
  // Subscribe to product updates
  window.API.subscribeToProducts((products) => {
    console.log('🔄 Real-time product update received');
    currentProducts = products;
    
    // Update UI
    if (document.getElementById('htmlProducts')) {
      window.htmlProducts = currentProducts.filter(p => p.main_category === 'html-css-js');
      window.pythonProducts = currentProducts.filter(p => p.main_category === 'python');
      window.opensourceProducts = currentProducts.filter(p => p.main_category === 'open-source');
      
      displayProducts(window.htmlProducts, 'htmlProducts');
      displayProducts(window.pythonProducts, 'pythonProducts');
      displayProducts(window.opensourceProducts, 'opensourceProducts');
    }
  });
}

// Enhanced product display with real-time data
function displayProducts(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray);">
        <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <h3>No products found</h3>
        <p>Check back later for new digital products!</p>
      </div>
    `;
    return;
  }

  products.forEach(product => {
    const productCard = createProductCard(product);
    container.appendChild(productCard);
  });

  // Re-attach event listeners after rendering
  attachProductEventListeners();
}

function createProductCard(product) {
  const productCard = document.createElement('div');
  productCard.className = 'product-card';
  productCard.setAttribute('data-category', product.sub_category);
  productCard.setAttribute('data-id', product.id);

  const badgeHTML = product.price === 0 ? 
    '<div class="product-badge">Free</div>' : '';

  const imageHTML = product.images && product.images.length > 0 ? 
    `<img src="${product.images[0]}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
    `<i class="${product.icon}"></i>`;

  const liveDemoBadge = product.has_live_demo ? 
    '<span class="live-demo-indicator"><i class="fas fa-play-circle"></i> Live Demo</span>' : '';

  const actionButton = product.main_category === 'open-source' || product.price === 0 ?
    `<button class="download-btn free-download-btn" data-id="${product.id}" data-title="${product.title}">
        <i class="fas fa-download"></i> Free Download
    </button>` :
    `<button class="download-btn" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}">
        <i class="fas fa-shopping-cart"></i> Buy - $${product.price.toFixed(2)}
    </button>`;

  productCard.innerHTML = `
    ${badgeHTML}
    <div class="product-image">
        ${imageHTML}
    </div>
    <div class="product-info">
        <div class="product-category">${product.sub_category}</div>
        <h3 class="product-title">${product.title} ${liveDemoBadge}</h3>
        <p class="product-description">${product.description}</p>
        ${product.price > 0 ? `<div class="product-price">$${product.price.toFixed(2)}</div>` : ''}
        <div class="product-actions">
            ${actionButton}
            <a href="product-detail.html?id=${product.id}" class="btn" style="background-color: var(--gray); text-decoration: none;">
                View Details
            </a>
            ${product.has_live_demo ? `
                <a href="${product.live_demo_url}" class="live-demo-btn" target="_blank">
                    <i class="fas fa-play-circle"></i> Live Demo
                </a>
            ` : ''}
        </div>
    </div>
  `;

  return productCard;
}

// Attach event listeners to product buttons
function attachProductEventListeners() {
  // Add to cart buttons
  document.querySelectorAll('.download-btn:not(.free-download-btn)').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const title = this.getAttribute('data-title');
      const price = parseFloat(this.getAttribute('data-price'));
      addToCartForPayment(id, title, price);
    });
  });

  // Free download buttons
  document.querySelectorAll('.free-download-btn').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const title = this.getAttribute('data-title');
      downloadProduct(id, title);
    });
  });
}

// Download free product
function downloadProduct(productId, productTitle) {
  try {
    console.log(`📥 Downloading free product: ${productTitle}`);
    
    // Create a simple download (replace with actual file download)
    const content = `
# ${productTitle}

Thank you for downloading from CodeWithTechDev!

This is a free digital product. Enjoy using it in your projects!

## Installation:
1. Extract the files
2. Follow the included documentation
3. Customize as needed

## Support:
If you need help, contact: support@codewithtechdev.com

Happy coding! 🚀
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productTitle.replace(/\s+/g, '_')}_Free_Download.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    showNotification(`"${productTitle}" download started!`, 'success');
    
  } catch (error) {
    console.error('Download error:', error);
    showNotification('Download failed. Please try again.', 'error');
  }
}

// Add to cart for payment
function addToCartForPayment(productId, productTitle, productPrice) {
  try {
    console.log(`🛒 Adding to cart: ${productTitle}`);
    
    // Create a mock event object for the addToCart function
    const mockEvent = {
      target: {
        getAttribute: (attr) => {
          if (attr === 'data-id') return productId;
          if (attr === 'data-title') return productTitle;
          if (attr === 'data-price') return productPrice;
          return null;
        }
      }
    };

    // Check if addToCart function exists
    if (typeof addToCart === 'function') {
      addToCart(mockEvent);
    } else {
      // Fallback: add directly to cart
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item.id == productId);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: productId,
          title: productTitle,
          price: productPrice,
          quantity: 1
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart UI if function exists
      if (typeof updateCart === 'function') {
        updateCart();
      }
      
      // Show notification
      showNotification(`"${productTitle}" added to cart!`, 'success');
    }
    
  } catch (error) {
    console.error('Add to cart error:', error);
    showNotification('Failed to add to cart. Please try again.', 'error');
  }
}

// Show notification to user
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `product-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add styles if not already added
  if (!document.querySelector('#notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .product-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
        max-width: 400px;
      }
      .product-notification.success { background: var(--success); }
      .product-notification.error { background: var(--error); }
      .product-notification.info { background: var(--primary); }
      .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

// Initialize category filtering (if on index page)
function setupCategoryFiltering() {
  const htmlTabs = document.querySelectorAll('#html-css-js .category-tab');
  const pythonTabs = document.querySelectorAll('#python .category-tab');

  // HTML category tabs
  htmlTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs in the HTML section
      htmlTabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');
      filterProducts(category, 'html');
    });
  });

  // Python category tabs
  pythonTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs in the Python section
      pythonTabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');
      filterProducts(category, 'python');
    });
  });
}

// Filter products by category
function filterProducts(category, mainCategory) {
  if (category === 'all') {
    // Show all products
    if (mainCategory === 'html') {
      displayProducts(window.htmlProducts, 'htmlProducts');
    } else {
      displayProducts(window.pythonProducts, 'pythonProducts');
    }
  } else {
    // Filter by subcategory
    const products = mainCategory === 'html' ? window.htmlProducts : window.pythonProducts;
    const filtered = products.filter(product => product.sub_category === category);
    const containerId = mainCategory === 'html' ? 'htmlProducts' : 'pythonProducts';
    displayProducts(filtered, containerId);
  }
}

// Initialize subcategory previews (if needed)
function initializeSubcategoryPreviews() {
  console.log('🔍 Initializing subcategory previews...');
  // This function would set up the sidebar previews
  // Add your subcategory preview logic here
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing products...');
  
  try {
    // Wait a bit for API to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await loadProductsFromDatabase();
    setupRealTimeUpdates();
    
    // Setup category filtering if on index page
    if (document.getElementById('htmlProducts')) {
      setupCategoryFiltering();
    }
    
    console.log('✅ Products initialized successfully');
  } catch (error) {
    console.error('❌ Products initialization failed:', error);
  }
});

// Make functions globally available
window.downloadProduct = downloadProduct;
window.addToCartForPayment = addToCartForPayment;
window.loadProductsFromDatabase = loadProductsFromDatabase;