// Main application initialization
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing CodeWithTechDev Marketplace...');
    
    try {
        // Initialize all components
        await initApplication();
        
        // Setup real-time updates
        setupRealTimeUpdates();
        
        console.log('✅ Application initialized successfully');
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        showErrorToUser('Failed to load application. Please refresh the page.');
    }
});

async function initApplication() {
    // Initialize cart
    if (typeof initCart === 'function') {
        initCart();
    }
    
    // Initialize sidebar navigation
    if (typeof initSidebarNavigation === 'function') {
        initSidebarNavigation();
    }
    
    // Setup category filtering
    if (typeof setupCategoryFiltering === 'function') {
        setupCategoryFiltering();
    }
    
    // Load products if on index page
    if (document.getElementById('htmlProducts')) {
        await loadProductsFromDatabase();
        
        // Display products
        if (typeof displayProducts === 'function') {
            displayProducts(window.htmlProducts, 'htmlProducts');
            displayProducts(window.pythonProducts, 'pythonProducts');
            displayProducts(window.opensourceProducts, 'opensourceProducts');
        }
        
        // Initialize subcategory previews
        if (typeof initializeSubcategoryPreviews === 'function') {
            initializeSubcategoryPreviews();
        }
    }
    
    // Initialize contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm(this);
        });
    }
    
    // Setup smooth scrolling
    setupSmoothScrolling();
}

function setupSmoothScrolling() {
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href;
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

function setupRealTimeUpdates() {
    // Setup product update polling
    if (typeof API !== 'undefined' && API.subscribeToProducts) {
        API.subscribeToProducts((products) => {
            console.log('🔄 Real-time product update received');
            updateProductDisplays(products);
        });
    }
}

function updateProductDisplays(products) {
    // Update global product arrays
    window.htmlProducts = products.filter(p => p.main_category === 'html-css-js');
    window.pythonProducts = products.filter(p => p.main_category === 'python');
    window.opensourceProducts = products.filter(p => p.main_category === 'open-source');
    
    // Update UI if on index page
    if (document.getElementById('htmlProducts')) {
        if (typeof displayProducts === 'function') {
            displayProducts(window.htmlProducts, 'htmlProducts');
            displayProducts(window.pythonProducts, 'pythonProducts');
            displayProducts(window.opensourceProducts, 'opensourceProducts');
        }
    }
}

async function handleContactForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        // Show loading state
        submitBtn.innerHTML = '<div class="loading-spinner"></div> Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        form.reset();
        
    } catch (error) {
        console.error('Contact form error:', error);
        alert('Sorry, there was an error sending your message. Please try again.');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function showErrorToUser(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        padding: 15px;
    `;
    errorDiv.innerHTML = `
        <strong>Error:</strong> ${message}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer;">×</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Export for global access
window.initApplication = initApplication;