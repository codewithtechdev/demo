// Enhanced Admin functionality with real-time updates - FIXED VERSION
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin page loaded, checking authentication...');
    
    // Check authentication first
    if (!checkAdminAuth()) {
        console.log('Authentication failed, redirecting...');
        return;
    }

    console.log('Authentication successful, initializing admin panel...');
    loadProductsFromStorage();
    initAdminTabs();
    initProductForm();
    displayProductList();
    displayOrders();
    setupRealTimeUpdates();
    setupAdminLogout();
});

// Enhanced authentication check - FIXED
function checkAdminAuth() {
    try {
        const session = localStorage.getItem('adminSession');
        console.log('Session data:', session);
        
        if (!session) {
            showAuthError('No active session found. Please login again.');
            return false;
        }

        const sessionData = JSON.parse(session);
        const sessionTimeout = 30 * 60 * 1000; // 30 minutes
        const timeElapsed = Date.now() - sessionData.timestamp;
        
        console.log('Time elapsed since login:', timeElapsed);
        
        if (timeElapsed < sessionTimeout) {
            console.log('Authentication successful');
            return true;
        } else {
            console.log('Session expired');
            localStorage.removeItem('adminSession');
            showAuthError('Session expired. Please login again.');
            return false;
        }
    } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('adminSession');
        showAuthError('Authentication error. Please login again.');
        return false;
    }
}

function showAuthError(message) {
    // Create a nice error page instead of just alert
    document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
            <div style="background: rgba(255,255,255,0.1); padding: 3rem; border-radius: 15px; backdrop-filter: blur(10px);">
                <h1 style="font-size: 2rem; margin-bottom: 1rem;">
                    <i class="fas fa-exclamation-triangle"></i> Access Required
                </h1>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="window.location.href='index.html'" 
                            style="padding: 0.8rem 1.5rem; background: #4CAF50; border: none; border-radius: 5px; color: white; cursor: pointer; font-size: 1rem;">
                        <i class="fas fa-home"></i> Back to Store
                    </button>
                    <button onclick="location.reload()" 
                            style="padding: 0.8rem 1.5rem; background: #2196F3; border: none; border-radius: 5px; color: white; cursor: pointer; font-size: 1rem;">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupAdminLogout() {
    const logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('adminSession');
                window.location.href = 'index.html';
            }
        });
    }
}

// Rest of your admin functions remain the same but with the auth check
function initAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Initialize product form with subcategory selection and live demo
function initProductForm() {
    const form = document.getElementById('productForm');
    const mainCategorySelect = document.getElementById('productType');
    const subCategorySelect = document.getElementById('productSubCategory');

    // Update subcategories when main category changes
    if (mainCategorySelect && subCategorySelect) {
        mainCategorySelect.addEventListener('change', function() {
            updateSubcategoryOptions(this.value);
        });

        // Initialize subcategories
        updateSubcategoryOptions(mainCategorySelect.value);
    }

    // File upload functionality
    const imageInput = document.getElementById('productImages');
    const videoInput = document.getElementById('productVideo');
    const pdfInput = document.getElementById('productPDF');
    const filesInput = document.getElementById('productFiles');

    // Image upload preview
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files, 'imagePreview', 'image');
        });
    }

    // Video upload preview
    if (videoInput) {
        videoInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files, 'videoPreview', 'video');
        });
    }

    // PDF upload preview
    if (pdfInput) {
        pdfInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files, 'pdfPreview', 'pdf');
        });
    }

    // Product files upload
    if (filesInput) {
        filesInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files, 'filesPreview', 'file');
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addProductFromForm();
        });
    }

    // Product search
    const searchInput = document.getElementById('productSearch');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', searchProducts);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
}

// Update subcategory options based on main category
function updateSubcategoryOptions(mainCategory) {
    const subCategorySelect = document.getElementById('productSubCategory');
    if (!subCategorySelect) return;

    // Clear existing options
    subCategorySelect.innerHTML = '';

    // Add options based on main category
    if (subcategories[mainCategory]) {
        subcategories[mainCategory].forEach(subCat => {
            const option = document.createElement('option');
            option.value = subCat.value;
            option.textContent = subCat.label;
            subCategorySelect.appendChild(option);
        });
    }
}

// Handle file upload and preview
function handleFileUpload(files, previewId, fileType) {
    const previewContainer = document.getElementById(previewId);
    if (!previewContainer) return;

    previewContainer.innerHTML = '';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';

            if (fileType === 'image') {
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button class="remove-preview" data-file="${file.name}">&times;</button>
                `;
            } else if (fileType === 'video') {
                previewItem.innerHTML = `
                    <video controls>
                        <source src="${e.target.result}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <button class="remove-preview" data-file="${file.name}">&times;</button>
                `;
            } else {
                previewItem.innerHTML = `
                    <div class="file-icon">
                        <i class="fas fa-file"></i>
                        <small>${file.name}</small>
                    </div>
                    <button class="remove-preview" data-file="${file.name}">&times;</button>
                `;
            }

            previewContainer.appendChild(previewItem);

            // Add remove event
            const removeBtn = previewItem.querySelector('.remove-preview');
            removeBtn.addEventListener('click', function() {
                previewItem.remove();

                // Clear the file input
                if (fileType === 'image') {
                    document.getElementById('productImages').value = '';
                } else if (fileType === 'video') {
                    document.getElementById('productVideo').value = '';
                } else if (fileType === 'pdf') {
                    document.getElementById('productPDF').value = '';
                } else {
                    document.getElementById('productFiles').value = '';
                }
            });
        };

        reader.readAsDataURL(file);
    }
}

// Add product from form
function addProductFromForm() {
    if (!checkAdminAuth()) return;

    const mainCategory = document.getElementById('productType').value;
    const subCategory = document.getElementById('productSubCategory').value;
    const title = document.getElementById('productTitle').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const icon = document.getElementById('productIcon').value;
    const hasLiveDemo = document.getElementById('productLiveDemo').checked;
    const liveDemoUrl = document.getElementById('productLiveDemoUrl').value;

    // Enhanced validation
    if (!title || !description || !price || price <= 0) {
        showNotification('Please fill in all required fields with valid data', 'error');
        return;
    }

    // Generate unique ID
    let id;
    if (mainCategory === 'html-css-js') {
        id = htmlProducts.length > 0 ? Math.max(...htmlProducts.map(p => p.id)) + 1 : 1;
    } else {
        id = pythonProducts.length > 0 ? Math.max(...pythonProducts.map(p => p.id)) + 1 : 101;
    }

    const newProduct = {
        id,
        title,
        mainCategory,
        subCategory,
        description,
        price,
        icon,
        hasLiveDemo,
        liveDemoUrl: hasLiveDemo ? liveDemoUrl : '',
        features: [
            "High quality code",
            "Well documented",
            "Easy to customize",
            "Responsive design"
        ],
        files: {
            images: [],
            video: null,
            pdf: null,
            productFiles: null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Add to appropriate array
    if (mainCategory === 'html-css-js') {
        htmlProducts.push(newProduct);
    } else {
        pythonProducts.push(newProduct);
    }

    // Save to localStorage
    saveProductsToStorage();

    // Refresh product displays
    displayProductList();
    
    // Show success message
    showNotification('Product added successfully!', 'success');

    // Reset form
    document.getElementById('productForm').reset();
    document.getElementById('productIcon').value = 'fas fa-code';
    document.getElementById('liveDemoUrlGroup').style.display = 'none';

    // Clear file previews
    ['imagePreview', 'videoPreview', 'pdfPreview', 'filesPreview'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = '';
    });

    // Broadcast update to index page if open
    broadcastProductUpdate();
}

// Enhanced delete with confirmation
function deleteProduct(id) {
    if (!checkAdminAuth()) return;

    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        if (id < 100) {
            const index = htmlProducts.findIndex(p => p.id === id);
            if (index !== -1) htmlProducts.splice(index, 1);
        } else {
            const index = pythonProducts.findIndex(p => p.id === id);
            if (index !== -1) pythonProducts.splice(index, 1);
        }

        saveProductsToStorage();
        displayProductList();
        showNotification('Product deleted successfully!', 'success');
        broadcastProductUpdate();
    }
}

// Real-time update system
function setupRealTimeUpdates() {
    // Listen for storage changes (for cross-tab updates)
    window.addEventListener('storage', function(e) {
        if (e.key === 'htmlProducts' || e.key === 'pythonProducts') {
            loadProductsFromStorage();
            displayProductList();
        }
    });
}

function broadcastProductUpdate() {
    // Update other tabs
    localStorage.setItem('productsLastUpdated', Date.now().toString());
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .admin-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 5px;
                color: white;
                z-index: 10001;
                display: flex;
                align-items: center;
                gap: 1rem;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            }
            .admin-notification.success { background: #4CAF50; }
            .admin-notification.error { background: #f44336; }
            .admin-notification.info { background: #2196F3; }
            .admin-notification button {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Enhanced product display in admin
function displayProductList() {
    const productList = document.getElementById('productList');
    if (!productList) return;

    productList.innerHTML = '';

    const allProducts = [...htmlProducts, ...pythonProducts];

    if (allProducts.length === 0) {
        productList.innerHTML = '<p class="no-products">No products added yet. Add your first product above!</p>';
        return;
    }

    // Sort by creation date (newest first)
    allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    allProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-list-item';

        const liveDemoBadge = product.hasLiveDemo ? 
            '<span class="live-demo-badge"><i class="fas fa-play-circle"></i> Live Demo</span>' : '';

        const dateAdded = new Date(product.createdAt).toLocaleDateString();

        productItem.innerHTML = `
            <div class="product-list-info">
                <h4>${product.title} ${liveDemoBadge}</h4>
                <div class="product-list-meta">
                    <span><i class="fas fa-tag"></i> ${product.mainCategory === 'html-css-js' ? 'HTML/CSS/JS' : 'Python'}</span>
                    <span><i class="fas fa-folder"></i> ${product.subCategory}</span>
                    <span><i class="fas fa-dollar-sign"></i> $${product.price.toFixed(2)}</span>
                    <span><i class="fas fa-calendar"></i> ${dateAdded}</span>
                </div>
            </div>
            <div class="product-list-actions">
                <button class="edit-btn" data-id="${product.id}" title="Edit Product">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" data-id="${product.id}" title="Delete Product">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        productList.appendChild(productItem);
    });

    // Add event listeners
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteProduct(id);
        });
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editProduct(id);
        });
    });
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const allProducts = [...htmlProducts, ...pythonProducts];

    const filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.subCategory.toLowerCase().includes(searchTerm)
    );

    const productList = document.getElementById('productList');
    if (!productList) return;

    productList.innerHTML = '';

    if (filteredProducts.length === 0) {
        productList.innerHTML = '<p>No products found matching your search.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-list-item';

        const liveDemoBadge = product.hasLiveDemo ? '<span style="color: var(--neon-blue); margin-left: 10px;"><i class="fas fa-play-circle"></i> Live Demo</span>' : '';

        productItem.innerHTML = `
            <div class="product-list-info">
                <h4>${product.title} ${liveDemoBadge}</h4>
                <div class="product-list-meta">
                    <span>Type: ${product.mainCategory === 'html-css-js' ? 'HTML/CSS/JS' : 'Python'}</span>
                    <span>Category: ${product.subCategory}</span>
                    <span>Price: $${product.price.toFixed(2)}</span>
                </div>
            </div>
            <div class="product-list-actions">
                <button class="edit-btn" data-id="${product.id}">Edit</button>
                <button class="delete-btn" data-id="${product.id}">Delete</button>
            </div>
        `;

        productList.appendChild(productItem);
    });

    // Re-add event listeners
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteProduct(id);
        });
    });
}

// Edit product function
function editProduct(id) {
    // For now, just show a message
    // In a real application, you would populate the form with product data
    alert('Edit functionality would open here. For this demo, you can delete and recreate the product.');
}

// Display orders (mock data)
function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    const orders = [
        {
            id: 'ORD-001',
            date: '2023-11-15',
            status: 'completed',
            customer: 'John Doe',
            email: 'john@example.com',
            items: [
                { name: 'Responsive Admin Dashboard', price: 29.99, quantity: 1 }
            ],
            total: 29.99
        },
        {
            id: 'ORD-002',
            date: '2023-11-14',
            status: 'pending',
            customer: 'Jane Smith',
            email: 'jane@example.com',
            items: [
                { name: 'Web Scraping Tool', price: 24.99, quantity: 1 },
                { name: 'Data Analysis Toolkit', price: 34.99, quantity: 1 }
            ],
            total: 59.98
        }
    ];

    ordersList.innerHTML = '';

    orders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';

        orderItem.innerHTML = `
            <div class="order-header">
                <div>
                    <span class="order-id">${order.id}</span>
                    <span class="order-date">${order.date}</span>
                </div>
                <span class="order-status status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
            <div class="order-details">
                <div class="order-customer">
                    <h5>Customer</h5>
                    <p>${order.customer}</p>
                    <p>${order.email}</p>
                </div>
                <div class="order-items">
                    <h5>Items</h5>
                    ${order.items.map(item => `
                        <p>${item.quantity} x ${item.name}</p>
                    `).join('')}
                </div>
                <div class="order-total">
                    <h5>Total</h5>
                    <p>$${order.total.toFixed(2)}</p>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn" style="padding: 0.5rem 1rem;">View Details</button>
                ${order.status === 'pending' ? `
                    <button class="btn" style="background: var(--success); padding: 0.5rem 1rem;">Complete Order</button>
                ` : ''}
            </div>
        `;

        ordersList.appendChild(orderItem);
    });
}