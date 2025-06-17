// RevenueCat for Make More Money Challenge ($25k)
// Web implementation using RevenueCat REST API

const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;
const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1';

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
    this.userId = userId;
    this.initialized = true;
    
    try {
      // In a real implementation, this would configure RevenueCat
      console.log('RevenueCat configured for user:', userId);
      
      // Load customer info
      await this.loadCustomerInfo();
      
      // Load available products
      await this.loadProducts();
      
    } catch (error) {
      console.error('RevenueCat configuration failed:', error);
    }
  }

  async loadCustomerInfo() {
    if (!REVENUECAT_API_KEY) {
      throw new Error('RevenueCat API key is required');
    }

    const response = await fetch(`${REVENUECAT_API_URL}/subscribers/${this.userId}`, {
      headers: {
        'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load customer info');
    }

    this.customerInfo = await response.json();
  }

  async loadProducts() {
    try {
      // In real implementation, this would fetch from RevenueCat
      this.products = { ...deathProducts };
      console.log('Products loaded:', this.products);
    } catch (error) {
      console.error('Failed to load products:', error);
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
      throw new Error('Purchase failed');
    }

    const purchaseResult = await response.json();

    // Track death-defying purchases
    this.trackLifeExtension(productId);

    return {
      success: true,
      customerInfo: this.customerInfo,
      transaction: purchaseResult,
    };
  }



  trackLifeExtension(productId) {
    // Track when users purchase life extensions
    const product = this.products[productId];
    
    if (productId.includes('immortality')) {
      // User is attempting immortality
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
    if (!this.customerInfo) return false;
    
    return this.customerInfo.activeSubscriptions.some(sub => 
      sub.productId === productId && 
      sub.isActive && 
      new Date(sub.expirationDate) > new Date()
    );
  }

  async cancelSubscription(productId) {
    try {
      // In real implementation, this would call RevenueCat API
      this.customerInfo.activeSubscriptions = this.customerInfo.activeSubscriptions.map(sub => 
        sub.productId === productId ? { ...sub, isActive: false } : sub
      );

      localStorage.setItem(
        `subscriptions_${this.userId}`, 
        JSON.stringify(this.customerInfo.activeSubscriptions)
      );

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
  if (!userId) {
    throw new Error('User ID is required for RevenueCat initialization');
  }
  await revenueCat.configure(userId);
  console.log('RevenueCat initialized for DeathCast');
};

export const purchasePremium = async (productId) => {
  try {
    const result = await revenueCat.purchaseProduct(productId);
    return result.success;
  } catch (error) {
    console.error('Premium purchase failed:', error);
    return false;
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
