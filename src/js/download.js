// Download Manager for Payment Success Page
class DownloadManager {
    constructor() {
        this.downloadTimer = 10; // 10 seconds countdown
        this.timerInterval = null;
        this.orderData = null;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Download Manager...');
        
        // Get order ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order');
        
        if (orderId) {
            await this.loadOrderDetails(orderId);
        } else {
            this.showError('No order ID found in URL');
        }

        this.startDownloadTimer();
        this.setupEventListeners();
    }

    async loadOrderDetails(orderId) {
        try {
            // Show loading state
            document.getElementById('orderId').textContent = orderId;
            document.getElementById('purchaseDate').textContent = new Date().toLocaleDateString();

            // In a real implementation, you would fetch order details from your API
            // For now, we'll use the cart from localStorage
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const savedProducts = JSON.parse(localStorage.getItem('neonProducts') || '[]');
            
            if (cart.length === 0) {
                this.showError('No products found in order');
                return;
            }

            // Map cart items to product details
            const downloadItems = cart.map(item => {
                const product = savedProducts.find(p => p.id === item.id) || {};
                return {
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    files: product.source_files || [],
                    documents: product.documents || [],
                    description: product.description || 'Digital product download'
                };
            });

            this.orderData = {
                orderId,
                items: downloadItems,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };

            this.displayDownloadItems(downloadItems);
            
        } catch (error) {
            console.error('Error loading order details:', error);
            this.showError('Failed to load order details');
        }
    }

    displayDownloadItems(items) {
        const container = document.getElementById('downloadItems');
        
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    No download items found for this order.
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => this.createDownloadItemHTML(item)).join('');
        
        // Add event listeners to download buttons
        container.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.download-item').dataset.itemId;
                this.downloadItem(itemId);
            });
        });
    }

    createDownloadItemHTML(item) {
        const fileCount = (item.files ? item.files.length : 0) + (item.documents ? item.documents.length : 0);
        const fileSize = this.calculateTotalFileSize(item);
        
        return `
            <div class="download-item" data-item-id="${item.id}">
                <div class="download-info">
                    <h4>${item.title} <span class="file-size">${fileCount} files</span></h4>
                    <p>${item.description}</p>
                    <div class="download-progress">
                        <div class="progress-bar" id="progress-${item.id}"></div>
                    </div>
                </div>
                <button class="download-btn" data-item-id="${item.id}">
                    <i class="fas fa-download"></i> Download Files
                </button>
            </div>
        `;
    }

    calculateTotalFileSize(item) {
        // Mock file size calculation
        // In real implementation, you would sum actual file sizes
        const baseSize = 2.5; // MB
        const fileCount = (item.files ? item.files.length : 0) + (item.documents ? item.documents.length : 0);
        return (baseSize * fileCount).toFixed(1) + ' MB';
    }

    startDownloadTimer() {
        const timerElement = document.getElementById('downloadTimer');
        if (!timerElement) return;

        this.timerInterval = setInterval(() => {
            timerElement.textContent = this.downloadTimer;
            this.downloadTimer--;

            if (this.downloadTimer < 0) {
                clearInterval(this.timerInterval);
                this.autoStartDownloads();
            }
        }, 1000);
    }

    skipTimer() {
        clearInterval(this.timerInterval);
        this.autoStartDownloads();
    }

    autoStartDownloads() {
        document.querySelector('.download-timer').style.display = 'none';
        
        // Auto-download the first item
        const firstDownloadBtn = document.querySelector('.download-btn');
        if (firstDownloadBtn) {
            firstDownloadBtn.click();
        }
    }

    async downloadItem(itemId) {
        const item = this.orderData?.items.find(i => i.id == itemId);
        if (!item) {
            this.showError('Product not found');
            return;
        }

        const downloadBtn = document.querySelector(`[data-item-id="${itemId}"] .download-btn`);
        const progressBar = document.getElementById(`progress-${itemId}`);
        const progressContainer = progressBar?.parentElement;

        try {
            // Show loading state
            if (downloadBtn) {
                downloadBtn.innerHTML = '<div class="loading-spinner"></div> Preparing...';
                downloadBtn.disabled = true;
            }

            if (progressContainer) {
                progressContainer.style.display = 'block';
            }

            // Simulate download preparation
            await this.simulateDownloadPreparation(progressBar);

            // Create and trigger download
            await this.createDownload(item);

            // Show success state
            if (downloadBtn) {
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded';
                downloadBtn.style.background = 'linear-gradient(135deg, var(--success), #4caf50)';
            }

            // Track download in analytics
            this.trackDownload(item);

        } catch (error) {
            console.error('Download error:', error);
            this.showError(`Failed to download ${item.title}`);
            
            if (downloadBtn) {
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> Try Again';
                downloadBtn.disabled = false;
            }
            
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
        }
    }

    async simulateDownloadPreparation(progressBar) {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(resolve, 500);
                }
            }, 100);
        });
    }

    async createDownload(item) {
        // In a real implementation, this would download actual files from your server
        // For demo purposes, we'll create a mock download
        
        const content = `
# ${item.title}

Thank you for purchasing from CodeWithTechDev!

## Product Details:
- Name: ${item.title}
- Price: $${item.price}
- Purchase Date: ${new Date().toLocaleDateString()}

## Installation Instructions:
1. Extract the downloaded files
2. Follow the documentation included
3. Customize as needed for your project

## Support:
If you need help, contact us at support@codewithtechdev.com

Happy coding! 🚀
        `.trim();

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.title.replace(/\s+/g, '_')}_Documentation.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Simulate additional file downloads
        if (item.files && item.files.length > 0) {
            await this.downloadAdditionalFiles(item);
        }
    }

    async downloadAdditionalFiles(item) {
        // Simulate downloading additional files
        for (let i = 0; i < (item.files?.length || 0); i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const blob = new Blob([`Mock content for ${item.title} file ${i + 1}`], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${item.title.replace(/\s+/g, '_')}_File_${i + 1}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    async downloadAll() {
        if (!this.orderData?.items) {
            this.showError('No items to download');
            return;
        }

        for (const item of this.orderData.items) {
            await this.downloadItem(item.id);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between downloads
        }

        this.showSuccess('All files downloaded successfully!');
    }

    trackDownload(item) {
        // Track download in analytics
        console.log(`Download tracked: ${item.title}`);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                'event_category': 'product',
                'event_label': item.title,
                'value': item.price
            });
        }
    }

    showError(message) {
        const container = document.getElementById('downloadItems');
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
                    <h3>Download Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn" style="margin-top: 1rem;">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        }
    }

    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'success-message';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i> ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    setupEventListeners() {
        // Global event listeners
        window.skipTimer = () => this.skipTimer();
        window.downloadAll = () => this.downloadAll();
    }
}

// Initialize download manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DownloadManager();
});