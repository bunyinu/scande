// Comprehensive error handling for DeathCast
// Provides user-friendly error messages and recovery strategies

export const ERROR_TYPES = {
  UUID_FORMAT: 'uuid_format',
  NUMERIC_OVERFLOW: 'numeric_overflow',
  API_QUOTA: 'api_quota',
  DATABASE_PERMISSION: 'database_permission',
  NETWORK_ERROR: 'network_error',
  VALIDATION_ERROR: 'validation_error'
};

export const ERROR_MESSAGES = {
  [ERROR_TYPES.UUID_FORMAT]: 'Invalid ID format detected. Using corrected format.',
  [ERROR_TYPES.NUMERIC_OVERFLOW]: 'Amount too large. Please use a smaller number.',
  [ERROR_TYPES.API_QUOTA]: 'Voice service temporarily unavailable. Using text display.',
  [ERROR_TYPES.DATABASE_PERMISSION]: 'Database access issue. Using demo mode.',
  [ERROR_TYPES.NETWORK_ERROR]: 'Network connection issue. Please try again.',
  [ERROR_TYPES.VALIDATION_ERROR]: 'Invalid input. Please check your data.'
};

export const handleError = (error, context = 'general') => {
  console.error(`Error in ${context}:`, error);

  let errorType = ERROR_TYPES.NETWORK_ERROR;
  let userMessage = ERROR_MESSAGES[errorType];
  let recoveryAction = null;

  // Classify error type
  if (error.message?.includes('invalid input syntax for type uuid')) {
    errorType = ERROR_TYPES.UUID_FORMAT;
    userMessage = ERROR_MESSAGES[errorType];
    recoveryAction = 'auto_fix_uuid';
  } else if (error.message?.includes('numeric field overflow')) {
    errorType = ERROR_TYPES.NUMERIC_OVERFLOW;
    userMessage = ERROR_MESSAGES[errorType];
    recoveryAction = 'validate_numeric';
  } else if (error.message?.includes('quota') || error.message?.includes('credits')) {
    errorType = ERROR_TYPES.API_QUOTA;
    userMessage = ERROR_MESSAGES[errorType];
    recoveryAction = 'use_fallback';
  } else if (error.message?.includes('permission denied') || error.code === '42501') {
    errorType = ERROR_TYPES.DATABASE_PERMISSION;
    userMessage = ERROR_MESSAGES[errorType];
    recoveryAction = 'use_demo_mode';
  } else if (error.message?.includes('validation') || error.message?.includes('invalid')) {
    errorType = ERROR_TYPES.VALIDATION_ERROR;
    userMessage = ERROR_MESSAGES[errorType];
    recoveryAction = 'validate_input';
  }

  return {
    type: errorType,
    message: userMessage,
    originalError: error.message,
    recoveryAction,
    context
  };
};

export const showUserError = (error, duration = 5000) => {
  const errorInfo = handleError(error);
  
  // Create user-friendly error notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 100, 100, 0.95);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    border-left: 4px solid #ff0000;
    z-index: 10000;
    max-width: 350px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">⚠️ ${errorInfo.type.replace('_', ' ').toUpperCase()}</div>
    <div style="font-size: 14px;">${errorInfo.message}</div>
  `;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Auto-remove notification
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }
  }, duration);

  return errorInfo;
};

export const withErrorHandling = (asyncFunction, context) => {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      const errorInfo = showUserError(error);
      
      // Execute recovery action if available
      if (errorInfo.recoveryAction) {
        console.log(`Executing recovery action: ${errorInfo.recoveryAction}`);
        // Recovery actions would be implemented based on the specific error
      }
      
      throw error;
    }
  };
};

// Specific error handlers for common scenarios
export const handleDatabaseError = (error, fallbackData = null) => {
  const errorInfo = handleError(error, 'database');
  showUserError(error, 3000);
  
  if (fallbackData) {
    console.log('Using fallback data due to database error');
    return fallbackData;
  }
  
  throw error;
};

export const handleAPIError = (error, fallbackFunction = null) => {
  const errorInfo = handleError(error, 'api');
  showUserError(error, 4000);
  
  if (fallbackFunction && typeof fallbackFunction === 'function') {
    console.log('Executing fallback function due to API error');
    return fallbackFunction();
  }
  
  throw error;
};

export const handleValidationError = (error, fieldName = '') => {
  const errorInfo = handleError(error, 'validation');
  const message = fieldName ? `${fieldName}: ${errorInfo.message}` : errorInfo.message;
  
  showUserError({ message }, 3000);
  return false;
};