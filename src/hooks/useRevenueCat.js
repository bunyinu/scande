import { useState, useEffect } from 'react';
import { 
  initRevenueCat, 
  purchasePremium, 
  getProducts, 
  getCustomerInfo, 
  hasActiveSubscription,
  restorePurchases,
  cancelSubscription 
} from '../lib/revenuecat';

export const useRevenueCat = (userId) => {
  const [products, setProducts] = useState({});
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    initializeRevenueCat();
  }, [userId]);

  const initializeRevenueCat = async () => {
    try {
      await initRevenueCat(userId);
      const productsData = getProducts();
      const customerData = await getCustomerInfo();
      
      setProducts(productsData);
      setCustomerInfo(customerData);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchase = async (productId) => {
    setPurchasing(true);
    try {
      const success = await purchasePremium(productId);
      if (success) {
        // Refresh customer info
        const updatedCustomerInfo = await getCustomerInfo();
        setCustomerInfo(updatedCustomerInfo);
      }
      return success;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    } finally {
      setPurchasing(false);
    }
  };

  const restore = async () => {
    try {
      const restoredInfo = await restorePurchases();
      setCustomerInfo(restoredInfo);
      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  };

  const cancel = async (productId) => {
    try {
      const result = await cancelSubscription(productId);
      if (result.success) {
        const updatedCustomerInfo = await getCustomerInfo();
        setCustomerInfo(updatedCustomerInfo);
      }
      return result.success;
    } catch (error) {
      console.error('Cancel failed:', error);
      return false;
    }
  };

  const isSubscribed = (productId) => {
    return hasActiveSubscription(productId);
  };

  return {
    products,
    customerInfo,
    loading,
    purchasing,
    purchase,
    restore,
    cancel,
    isSubscribed,
  };
};
