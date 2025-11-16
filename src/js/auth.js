// Netlify Functions Authentication System
class AdminAuth {
    constructor() {
        this.token = null;
        this.init();
    }

    async init() {
        await this.checkExistingSession();
        this.setupAdminLink();
    }

    async checkExistingSession() {
        try {
            const token = localStorage.getItem('adminToken');
            const tokenExpiry = localStorage.getItem('adminTokenExpiry');
            
            if (token && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
                this.token = token;
                console.log('✅ Admin session valid');
                return true;
            } else {
                this.clearSession();
            }
        } catch (error) {
            console.error('Session check error:', error);
            this.clearSession();
        }
        return false;
    }

    setupAdminLink() {
        // Handle admin links
        const adminLinks = document.querySelectorAll('[href*="admin.html"], .footer-admin-link');
        adminLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        });
    }

    async login(password) {
        try {
            const response = await window.API.adminLogin(password);
            
            if (response.success) {
                this.token = response.token;
                // Store token with expiry (24 hours)
                const expiry = Date.now() + (24 * 60 * 60 * 1000);
                localStorage.setItem('adminToken', this.token);
                localStorage.setItem('adminTokenExpiry', expiry.toString());
                return true;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout() {
        this.clearSession();
        window.location.href = 'index.html';
    }

    clearSession() {
        this.token = null;
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminTokenExpiry');
    }

    getToken() {
        return this.token;
    }

    isAuthenticated() {
        return this.checkExistingSession();
    }
}

// Initialize globally
window.adminAuth = new AdminAuth();