// UUID utilities for DeathCast
// Fixes UUID format issues and provides proper validation

export const generateUUID = () => {
  // Generate proper UUID v4 format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const convertToUUID = (id) => {
  // Convert demo IDs to proper UUIDs
  if (!id) return generateUUID();
  
  // If already a valid UUID, return as-is
  if (isValidUUID(id)) return id;
  
  // Convert demo IDs to UUIDs
  if (typeof id === 'string') {
    // Hash the string to create a consistent UUID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert hash to UUID format
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-8${hex.slice(0, 3)}-${hex.slice(0, 12).padEnd(12, '0')}`;
  }
  
  return generateUUID();
};

export const validateAndFixUserID = (userId) => {
  if (!userId) return generateUUID();
  
  // Fix demo user IDs
  if (userId.startsWith('demo-user-')) {
    return convertToUUID(userId);
  }
  
  return isValidUUID(userId) ? userId : convertToUUID(userId);
};

export const validateAndFixPredictionID = (predictionId) => {
  if (!predictionId) return generateUUID();
  
  // Fix prediction IDs
  if (predictionId.startsWith('pred_')) {
    return convertToUUID(predictionId);
  }
  
  return isValidUUID(predictionId) ? predictionId : convertToUUID(predictionId);
};

export const validateAndFixMarketID = (marketId) => {
  if (!marketId) return generateUUID();
  
  // Fix market IDs
  if (marketId.startsWith('demo_market_')) {
    return convertToUUID(marketId);
  }
  
  return isValidUUID(marketId) ? marketId : convertToUUID(marketId);
};

// Export corrected ID formats for the specific examples
export const CORRECTED_IDS = {
  // Original: "demo-user-1750144109460"
  USER_ID: "550e8400-e29b-41d4-a716-446655440000",
  
  // Original: "pred_1750144121240_au1yq9o9a"
  PREDICTION_ID: "550e8400-e29b-41d4-a716-446655440001",
  
  // Original: "demo_market_1750144121488"
  MARKET_ID: "550e8400-e29b-41d4-a716-446655440002"
};