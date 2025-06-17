// RevenueCat for Make More Money Challenge ($25k)
// Web implementation using RevenueCat REST API

const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;
const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1';

if (!REVENUECAT_API_KEY) {
  console.warn('RevenueCat API key not provided. Subscription features may be limited.');
}

export const deathProducts = {
  'death_scanner': {
    identifier: 'death_scanner_premium',
    price: 4.99,
    type: 'one_time',
    description: 'Unlock advanced death prediction features',
  },
  
  'life_extension_basic': {
    identifier: 'life_extension_basic',
    price: 9.99,
    type: 'monthly',
    features: [
      'Daily mortality reduction tips',
      'Danger alerts based on location',
      'Health optimization recommendations',
      'Add up to 5 years to prediction',
    ],
  },
  
  'life_extension_pro': {
    identifier: 'life_extension_pro', 
    price: 49.99,
    type: 'monthly',
    features: [
      'Everything in Basic',
      'AI health coach',
      'Real-time risk monitoring',
      'Emergency response system',
      'Add up to 15 years to prediction',
    ],
  },
  
  'immortality_package': {
    identifier: 'immortality_package',
    price: 199.99,
    type: 'monthly',
    features: [
      'Everything in Pro',
      'Quantum life extension therapy',
      'Digital consciousness backup',
      'Clone preparation service',
      'Theoretical immortality',
    ],
  },
  
  'death_insurance': {
    identifier: 'death_insurance',
    price: 19.99,
    type: 'monthly',
    description: 'If we predict correctly, your family gets $50,000',
  },
};

class RevenueCatWeb {
  constructor() {
    this.userId = null;
    this.customerInfo = null;
    this.products = {};
    this.initialized = false;
  }

  async configure(userId) {
    if (!userId) {
      throw new Error('User ID is required for RevenueCat configuration');
    }

    this.userId = userId;
    this.initialized = true;
    
    try {
      console.log('RevenueCat configured for user:', userId);
      
      // Load customer info
      await this.loadCustomerInfo();
      
      // Load available products
      await this.loadProducts();
      
    } catch (error) {
      console.error('RevenueCat configuration failed:', error);
      throw error;
    }
  }

  async loadCustomerInfo() {
    if (!REVENUECAT_API_KEY) {
      // Use local storage for demo when API key is not available
      const stored = localStorage.getItem(`customer_info_${this.userId}`);
      this.customerInfo = stored ? JSON.parse(stored) : {
        activeSubscriptions: [],
        purchases: [],
      };
      return;
    }

    try {
      const response = await fetch(`${REVENUECAT_API_URL}/subscribers/${this.userId}`, {
        headers: {
          'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load customer info: ${response.status} ${response.statusText}`);
      }

      this.customerInfo = await response.json();
    } catch (error) {
      console.error('Failed to load customer info:', error);
      // Fallback to local storage
      const stored = localStorage.getItem(`customer_info_${this.userId}`);
      this.customerInfo = stored ? JSON.parse(stored) : {
        activeSubscriptions: [],
        purchases: [],
      };
    }
  }

  async loadProducts() {
    try {
      this.products = { ...deathProducts };
      console.log('Products loaded:', this.products);
    } catch (error) {
      console.error('Failed to load products:', error);
      throw error;
    }
  }

  async purchaseProduct(productId) {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    const product = this.products[productId];
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    try {
      if (REVENUECAT_API_KEY) {
        const response = await fetch(`${REVENUECAT_API_URL}/subscribers/${this.userId}/purchases`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: productId,
            price: product.price,
            currency: 'USD'
          })
        });

        if (!response.ok) {
          throw new Error(`Purchase failed: ${response.status} ${response.statusText}`);
        }

        const purchaseResult = await response.json();
        this.customerInfo = purchaseResult.customer_info;
      } else {
        // Simulate purchase for demo
        const purchase = {
          productId,
          purchaseDate: new Date().toISOString(),
          expirationDate: product.type === 'monthly' ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          isActive: true,
        };

        if (!this.customerInfo.activeSubscriptions) {
          this.customerInfo.activeSubscriptions = [];
        }
        if (!this.customerInfo.purchases) {
          this.customerInfo.purchases = [];
        }

        this.customerInfo.activeSubscriptions.push(purchase);
        this.customerInfo.purchases.push(purchase);

        // Save to local storage
        localStorage.setItem(
          `customer_info_${this.userId}`, 
          JSON.stringify(this.customerInfo)
        );
      }

      // Track life-extending purchases
      this.trackLifeExtension(productId);

      return {
        success: true,
        customerInfo: this.customerInfo,
      };
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  trackLifeExtension(productId) {
    // Track when users purchase life extensions
    const product = this.products[productId];
    
    if (productId.includes('immortality')) {
      console.log('🏆 User purchased immortality package!');
      this.updateDeathPrediction('IMMORTAL');
    } else if (productId.includes('life_extension')) {
      console.log('⏰ User extended their life with:', product.identifier);
    }
  }

  updateDeathPrediction(status) {
    // Update death prediction based on subscription
    const event = new CustomEvent('deathPredictionUpdate', {
      detail: { status, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  async restorePurchases() {
    try {
      await this.loadCustomerInfo();
      return this.customerInfo;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  async getCustomerInfo() {
    if (!this.customerInfo) {
      await this.loadCustomerInfo();
    }
    return this.customerInfo;
  }

  hasActiveSubscription(productId) {
    if (!this.customerInfo || !this.customerInfo.activeSubscriptions) return false;
    
    return this.customerInfo.activeSubscriptions.some(sub => 
      sub.productId === productId && 
      sub.isActive && 
      (!sub.expirationDate || new Date(sub.expirationDate) > new Date())
    );
  }

  async cancelSubscription(productId) {
    try {
      if (REVENUECAT_API_KEY) {
        const response = await fetch(`${REVENUECAT_API_URL}/subscribers/${this.userId}/subscriptions/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Cancellation failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        this.customerInfo = result.customer_info;
      } else {
        // Simulate cancellation for demo
        if (this.customerInfo.activeSubscriptions) {
          this.customerInfo.activeSubscriptions = this.customerInfo.activeSubscriptions.map(sub => 
            sub.productId === productId ? { ...sub, isActive: false } : sub
          );

          localStorage.setItem(
            `customer_info_${this.userId}`, 
            JSON.stringify(this.customerInfo)
          );
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }
}

// Global instance
const revenueCat = new RevenueCatWeb();

// Export functions for easy use
export const initRevenueCat = async (userId) => {
  await revenueCat.configure(userId);
  console.log('RevenueCat initialized for DeathCast');
};

export const purchasePremium = async (productId) => {
  try {
    const result = await revenueCat.purchaseProduct(productId);
    return result.success;
  } catch (error) {
    console.error('Premium purchase failed:', error);
    throw error;
  }
};

export const getProducts = () => {
  return revenueCat.products;
};

export const getCustomerInfo = async () => {
  return await revenueCat.getCustomerInfo();
};

export const hasActiveSubscription = (productId) => {
  return revenueCat.hasActiveSubscription(productId);
};

export const restorePurchases = async () => {
  return await revenueCat.restorePurchases();
};

export const cancelSubscription = async (productId) => {
  return await revenueCat.cancelSubscription(productId);
};

// Hook for React components
export const useRevenueCat = () => {
  return {
    purchasePremium,
    getProducts,
    getCustomerInfo,
    hasActiveSubscription,
    restorePurchases,
    cancelSubscription,
  };
};

export default revenueCat;