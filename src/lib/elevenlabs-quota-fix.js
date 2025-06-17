// ElevenLabs quota management and fallback system
// Fixes API quota exceeded errors

export const QUOTA_LIMITS = {
  DAILY_LIMIT: 10000,
  CURRENT_AVAILABLE: 13,
  REQUIRED_CREDITS: 361,
  FALLBACK_ENABLED: true
};

export const checkQuotaAvailability = (requiredCredits = 100) => {
  const available = QUOTA_LIMITS.CURRENT_AVAILABLE;
  
  return {
    hasQuota: available >= requiredCredits,
    available,
    required: requiredCredits,
    deficit: Math.max(0, requiredCredits - available)
  };
};

// Fallback text-to-speech using Web Speech API
export const fallbackTextToSpeech = (text, voiceType = 'grim_reaper') => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice based on type
    const voiceConfig = {
      'grim_reaper': { rate: 0.7, pitch: 0.3, volume: 0.8 },
      'friendly_death': { rate: 1.2, pitch: 1.5, volume: 0.9 },
      'game_show_host': { rate: 1.1, pitch: 1.2, volume: 1.0 },
      'news_anchor': { rate: 1.0, pitch: 1.0, volume: 0.9 },
      'british_butler': { rate: 0.9, pitch: 0.8, volume: 0.8 },
      'sports_commentator': { rate: 1.3, pitch: 1.1, volume: 1.0 },
      'movie_trailer': { rate: 0.8, pitch: 0.6, volume: 0.9 },
      'robot_ai': { rate: 0.9, pitch: 0.4, volume: 0.8 },
      'valley_girl': { rate: 1.2, pitch: 1.6, volume: 0.9 },
      'pirate_captain': { rate: 1.0, pitch: 0.7, volume: 0.9 },
      'southern_preacher': { rate: 1.1, pitch: 0.9, volume: 1.0 },
      'philosopher': { rate: 0.8, pitch: 0.8, volume: 0.8 }
    };

    const config = voiceConfig[voiceType] || voiceConfig['grim_reaper'];
    
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;

    // Try to find appropriate voice
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer male voices for most death announcers
      const maleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('male') || 
        voice.name.toLowerCase().includes('david') ||
        voice.name.toLowerCase().includes('alex')
      );
      
      if (maleVoice) {
        utterance.voice = maleVoice;
      }
    }

    utterance.onend = () => {
      resolve({ success: true, method: 'fallback' });
    };

    utterance.onerror = (error) => {
      reject(new Error(`Speech synthesis failed: ${error.error}`));
    };

    speechSynthesis.speak(utterance);
  });
};

// Enhanced ElevenLabs with quota management
export const generateVoiceWithQuotaCheck = async (text, voiceType = 'grim_reaper') => {
  const estimatedCredits = Math.ceil(text.length / 4); // Rough estimate
  const quotaCheck = checkQuotaAvailability(estimatedCredits);
  
  if (!quotaCheck.hasQuota) {
    console.warn(`ElevenLabs quota insufficient. Available: ${quotaCheck.available}, Required: ${quotaCheck.required}`);
    
    if (QUOTA_LIMITS.FALLBACK_ENABLED) {
      console.log('Using fallback text-to-speech...');
      await fallbackTextToSpeech(text, voiceType);
      return { success: true, method: 'fallback', audioUrl: null };
    } else {
      throw new Error(`Insufficient quota. Need ${quotaCheck.deficit} more credits.`);
    }
  }

  // Try ElevenLabs API
  try {
    const { generateVoice } = await import('./elevenlabs');
    const audioUrl = await generateVoice(text, voiceType);
    return { success: true, method: 'elevenlabs', audioUrl };
  } catch (error) {
    console.error('ElevenLabs API failed:', error);
    
    if (QUOTA_LIMITS.FALLBACK_ENABLED) {
      console.log('Falling back to browser speech synthesis...');
      await fallbackTextToSpeech(text, voiceType);
      return { success: true, method: 'fallback', audioUrl: null };
    } else {
      throw error;
    }
  }
};

// Quota-aware announcement function
export const announceWithQuotaManagement = async (prediction, voiceType = 'grim_reaper') => {
  const message = `Your death prediction is complete. You will die on ${new Date(prediction.deathDate).toLocaleDateString()}. Cause: ${prediction.cause}. Confidence: ${prediction.confidence} percent.`;
  
  try {
    return await generateVoiceWithQuotaCheck(message, voiceType);
  } catch (error) {
    console.error('Voice announcement failed:', error);
    
    // Silent fallback - show text notification instead
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 10px;
      z-index: 10000;
      max-width: 300px;
      font-weight: bold;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 5000);
    
    return { success: true, method: 'text', audioUrl: null };
  }
};

// Quota monitoring
export const getQuotaStatus = () => {
  return {
    available: QUOTA_LIMITS.CURRENT_AVAILABLE,
    dailyLimit: QUOTA_LIMITS.DAILY_LIMIT,
    usagePercentage: ((QUOTA_LIMITS.DAILY_LIMIT - QUOTA_LIMITS.CURRENT_AVAILABLE) / QUOTA_LIMITS.DAILY_LIMIT * 100).toFixed(1),
    fallbackEnabled: QUOTA_LIMITS.FALLBACK_ENABLED
  };
};