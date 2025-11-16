// API Client for Netlify Functions
class API {
  constructor() {
    this.baseURL = '/.netlify/functions';
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}/${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products
  async getProducts(category = null) {
    const query = category ? `?category=${category}` : '';
    return this.request(`products${query}`);
  }

  async getProduct(id) {
    return this.request(`products?id=${id}`);
  }

  async createProduct(productData, token) {
    return this.request('products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, updates, token) {
    return this.request('products', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id, ...updates })
    });
  }

  async deleteProduct(id, token) {
    return this.request('products', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });
  }

  // Authentication
  async adminLogin(password) {
    return this.request('admin-auth', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }

  // Payments
  async processPayment(orderData, paymentMethod) {
    return this.request('payment', {
      method: 'POST',
      body: JSON.stringify({ orderData, paymentMethod })
    });
  }

  // Real-time updates
  subscribeToProducts(callback) {
    // Poll for updates every 30 seconds
    setInterval(async () => {
      try {
        const response = await this.getProducts();
        callback(response.data);
      } catch (error) {
        console.error('Product subscription error:', error);
      }
    }, 30000);
  }
}

// Initialize global API instance
window.API = new API();