// ElevenLabs for Voice AI Challenge ($25k)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

if (!ELEVENLABS_API_KEY) {
  throw new Error('ElevenLabs API key is required. Please set VITE_ELEVENLABS_KEY in your environment variables.');
}

export const deathVoices = {
  'grim_reaper': {
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    description: 'Deep, ominous death announcements',
    personality: 'The classic Grim Reaper - dark and foreboding'
  },
  'friendly_death': {
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    description: 'Cheerful mortality updates',
    personality: 'Upbeat and positive about your demise'
  },
  'philosopher': {
    voiceId: 'ErXwobaYiN019PkySvjV',
    description: 'Existential death contemplation',
    personality: 'Thoughtful and wise about mortality'
  },
  'game_show_host': {
    voiceId: 'TxGEqnHWrfWFTfGW9XjX',
    description: 'Exciting game show style death announcements',
    personality: 'Enthusiastic host announcing your death like a prize!'
  },
  'news_anchor': {
    voiceId: 'CYw3kZ02Hs0563khs1Fj',
    description: 'Breaking news style mortality reports',
    personality: 'Professional news reporter covering your death'
  },
  'british_butler': {
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    description: 'Polite and proper death notifications',
    personality: 'Refined British butler announcing your passing'
  },
  'sports_commentator': {
    voiceId: 'IKne3meq5aSn9XLyUdCD',
    description: 'Play-by-play commentary on your death',
    personality: 'Exciting sports announcer calling your final moments'
  },
  'movie_trailer': {
    voiceId: 'bVMeCyTHy58xNoL34h3p',
    description: 'Epic movie trailer style death reveals',
    personality: 'Dramatic movie trailer narrator for your death'
  },
  'robot_ai': {
    voiceId: 'flq6f7yk4E4fJM5XTYuZ',
    description: 'Cold, calculated AI death analysis',
    personality: 'Emotionless AI calculating your termination'
  },
  'southern_preacher': {
    voiceId: 'g5CIjZEefAph4nQFvHAz',
    description: 'Fire and brimstone death sermons',
    personality: 'Passionate preacher warning of your doom'
  },
  'valley_girl': {
    voiceId: 'XB0fDUnXU5powFXDhCwa',
    description: 'Casual, trendy death notifications',
    personality: 'Like, totally casual about your death, whatever'
  },
  'pirate_captain': {
    voiceId: 'SOYHLrjzK2X1ezoPC6cr',
    description: 'Swashbuckling death announcements',
    personality: 'Gruff pirate captain announcing your voyage to Davy Jones'
  }
};

export const initElevenLabs = async () => {
  console.log('ElevenLabs Voice AI initialized for DeathCast');

  try {
    // Test API connection
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API connection failed: ${response.status} ${response.statusText}`);
    }

    console.log('ElevenLabs API connected successfully');
  } catch (error) {
    console.error('ElevenLabs initialization failed:', error);
    throw error;
  }
};

export const generateVoice = async (text, voiceType = 'grim_reaper') => {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for voice generation');
  }

  const voice = deathVoices[voiceType];
  if (!voice) {
    throw new Error(`Voice type ${voiceType} not found`);
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voice.voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Voice generation failed:', error);
    throw error;
  }
};

// Global audio management
let currentAudio = null;

export const stopCurrentAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

export const playAudio = async (audioUrl) => {
  if (!audioUrl) {
    throw new Error('Audio URL is required');
  }

  // Stop any currently playing audio
  stopCurrentAudio();

  try {
    currentAudio = new Audio(audioUrl);
    currentAudio.volume = 0.7;

    // Clean up when audio ends
    currentAudio.addEventListener('ended', () => {
      currentAudio = null;
    });

    await currentAudio.play();
    return currentAudio;
  } catch (error) {
    console.error('Audio playback failed:', error);
    throw error;
  }
};

export const announceDeathPrediction = async (prediction, voiceType = 'grim_reaper') => {
  const text = getPersonalizedDeathMessage(prediction, voiceType);

  console.log(`🎭 Using ${voiceType} voice: ${deathVoices[voiceType].personality}`);

  try {
    const audioUrl = await generateVoice(text, voiceType);
    await playAudio(audioUrl);
    return { audioUrl, voiceUsed: voiceType };
  } catch (error) {
    console.error('Death announcement failed:', error);
    throw error;
  }
};

const getPersonalizedDeathMessage = (prediction, voiceType) => {
  const userName = prediction.userName || 'mortal';
  const deathDate = new Date(prediction.deathDate).toLocaleDateString();
  const daysRemaining = prediction.daysRemaining;
  const cause = prediction.cause;
  const confidence = prediction.confidence;
  const marketPool = prediction.marketPool || 0;

  const messages = {
    'grim_reaper': `
      Attention ${userName}. I am Death, and your time has come.
      You will cease to exist on ${deathDate}.
      That's ${daysRemaining} days from now.
      Cause of termination: ${cause}.
      Confidence level: ${confidence} percent.
      Current betting pool on your demise: ${marketPool} dollars.
      Would you like to purchase additional time?
    `,

    'friendly_death': `
      Hi there ${userName}! Great news about your death prediction!
      You'll be passing away on ${deathDate} - isn't that exciting?
      That's only ${daysRemaining} days to go!
      You'll die from ${cause} - how fun!
      We're ${confidence} percent confident about this!
      People have bet ${marketPool} dollars on your death - you're popular!
      Want to buy some extra time? It's super easy!
    `,

    'game_show_host': `
      Ladies and gentlemen, ${userName}!
      Come on down! You're the next contestant on "The Price is Death!"
      Your death date is... ${deathDate}!
      That's ${daysRemaining} days away!
      Your cause of death is... ${cause}!
      With a confidence level of ${confidence} percent!
      The betting pool has reached ${marketPool} dollars!
      But wait! There's more! You can buy additional time right now!
    `,

    'news_anchor': `
      This is breaking news. ${userName}, age unknown, is predicted to die on ${deathDate}.
      That's ${daysRemaining} days from today.
      The cause of death is reported as ${cause}.
      Our mortality experts are ${confidence} percent confident in this prediction.
      The death prediction market has reached ${marketPool} dollars in total bets.
      Life extension packages are available for purchase.
      We'll continue to follow this story as it develops.
    `,

    'british_butler': `
      Good day, ${userName}. I regret to inform you of your impending demise.
      You shall depart this mortal coil on ${deathDate}.
      That provides you with ${daysRemaining} days to put your affairs in order.
      The manner of your passing shall be ${cause}.
      We are ${confidence} percent certain of this outcome.
      The wagering pool regarding your death has reached ${marketPool} dollars.
      Might I suggest our life extension services?
    `,

    'sports_commentator': `
      And here comes ${userName} down the mortality field!
      They're heading straight for the death zone on ${deathDate}!
      That's ${daysRemaining} days of game time remaining!
      It looks like ${cause} is going to take them down!
      The prediction accuracy is at ${confidence} percent!
      The crowd has bet ${marketPool} dollars on this outcome!
      But wait! They could still make a comeback with life extension!
    `,

    'movie_trailer': `
      In a world where death is inevitable...
      One person, ${userName}, will face their destiny on ${deathDate}.
      ${daysRemaining} days. One fate. ${cause}.
      With ${confidence} percent certainty.
      ${marketPool} dollars in bets.
      But some rules... can be broken.
      Life Extension. Coming soon to a subscription near you.
    `,

    'robot_ai': `
      MORTALITY ANALYSIS COMPLETE.
      SUBJECT: ${userName}.
      TERMINATION DATE: ${deathDate}.
      COUNTDOWN: ${daysRemaining} DAYS REMAINING.
      TERMINATION METHOD: ${cause}.
      PREDICTION ACCURACY: ${confidence} PERCENT.
      MARKET VALUE: ${marketPool} DOLLARS.
      LIFE EXTENSION PROTOCOLS AVAILABLE.
    `,

    'valley_girl': `
      OMG ${userName}! So like, you're totally gonna die on ${deathDate}!
      That's like, ${daysRemaining} days away - so random!
      You're gonna die from ${cause} - that's like, so not cute!
      We're like, ${confidence} percent sure about this!
      People bet like, ${marketPool} dollars on your death - you're like, famous!
      But whatever, you can totally buy more time if you want!
    `,

    'pirate_captain': `
      Ahoy ${userName}! Ye be sailin' to Davy Jones' locker on ${deathDate}!
      That be ${daysRemaining} days before ye meet yer maker!
      Ye'll be done in by ${cause}, mark me words!
      I be ${confidence} percent certain of this, ye scurvy dog!
      The crew has wagered ${marketPool} pieces of eight on yer demise!
      But ye can still buy yerself more time, if ye have the coin!
    `
  };

  return messages[voiceType] || messages['grim_reaper'];
};

export const dailyMortalityReminder = async (user, voiceType = 'grim_reaper') => {
  const messages = getDailyMessages(user, voiceType);
  const todaysMessage = messages[Math.floor(Math.random() * messages.length)];

  console.log(`🌅 Daily reminder using ${voiceType} voice`);

  try {
    const audioUrl = await generateVoice(todaysMessage, voiceType);
    await playAudio(audioUrl);
    return { message: todaysMessage, audioUrl, voiceUsed: voiceType };
  } catch (error) {
    console.error('Daily reminder failed:', error);
    throw error;
  }
};

const getDailyMessages = (user, voiceType) => {
  const daysLeft = user.daysLeft || 365;
  const cause = user.cause || 'unknown causes';
  const confidence = user.confidence || 85;
  const marketGrowth = user.marketGrowth || '$500';

  const messagesByVoice = {
    'grim_reaper': [
      `Good morning, mortal. You have ${daysLeft} days remaining before I claim you.`,
      `Your death market gained ${marketGrowth} in bets today. People profit from your doom.`,
      `Based on yesterday's choices, you lost 3.2 hours of life. Foolish.`,
      `Reminder: Your predicted cause of death is still ${cause}. Inevitable.`,
      `Time is running out. Even immortality packages cannot save you forever.`,
      `Your mortality confidence has increased to ${confidence}%. Death approaches.`,
    ],

    'friendly_death': [
      `Good morning sunshine! You have ${daysLeft} wonderful days left to live!`,
      `Great news! Your death market gained ${marketGrowth} in bets today - you're so popular!`,
      `Oopsie! Yesterday's choices cost you 3.2 hours of life - but who's counting?`,
      `Just a friendly reminder: You'll still die from ${cause} - isn't that exciting?`,
      `Time's ticking away! Maybe grab our immortality package - it's super fun!`,
      `Your mortality confidence is now ${confidence}% - we're getting so close!`,
    ],

    'game_show_host': [
      `Good morning contestant! You have ${daysLeft} days left in the game of life!`,
      `Ding ding ding! Your death market gained ${marketGrowth} today - what a winner!`,
      `Ooh, tough break! Yesterday cost you 3.2 hours - but you're still in the game!`,
      `Survey says: ${cause} is still your number one cause of death!`,
      `Time's running out! Will you choose the immortality package behind door number three?`,
      `Your confidence level has reached ${confidence}% - you're in the final round!`,
    ],

    'news_anchor': [
      `Good morning. This is your daily mortality update. ${daysLeft} days remaining.`,
      `Market report: Your death prediction gained ${marketGrowth} in trading volume today.`,
      `Health update: Yesterday's lifestyle choices reduced your lifespan by 3.2 hours.`,
      `Medical reminder: ${cause} remains your primary mortality risk factor.`,
      `Consumer alert: Life extension packages are available for immediate purchase.`,
      `Statistical update: Prediction confidence has risen to ${confidence} percent.`,
    ],

    'british_butler': [
      `Good morning. I regret to inform you that ${daysLeft} days remain in your service.`,
      `The death market portfolio has appreciated by ${marketGrowth} today, if I may say so.`,
      `I'm afraid yesterday's activities have cost you 3.2 hours of life, sir.`,
      `Might I remind you that ${cause} remains your scheduled departure method.`,
      `Perhaps you'd consider our life extension services? Most agreeable rates.`,
      `Your mortality assessment stands at ${confidence} percent certainty, I'm told.`,
    ]
  };

  return messagesByVoice[voiceType] || messagesByVoice['grim_reaper'];
};

export const lastWordsRecording = async (lastWords) => {
  if (!lastWords.message || !lastWords.message.trim()) {
    throw new Error('Last words message is required');
  }

  const text = `
    These are the last words of ${lastWords.userName}.
    Recorded on ${new Date().toLocaleDateString()}.
    
    ${lastWords.message}
    
    This message was automatically delivered upon death verification.
    DeathCast - Predicting mortality since 2024.
  `;

  try {
    const audioUrl = await generateVoice(text, 'philosopher');
    
    // Store the recording for future delivery
    const response = await fetch('/api/last-words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: lastWords.userId,
        audioUrl,
        message: lastWords.message,
        recordedAt: new Date().toISOString(),
      })
    });

    if (!response.ok) {
      throw new Error('Failed to store last words recording');
    }
    
    return audioUrl;
  } catch (error) {
    console.error('Last words recording failed:', error);
    throw error;
  }
};

export const marketUpdateAnnouncement = async (marketData) => {
  const text = `
    Death market update.
    Total betting pool has reached ${marketData.totalPool} dollars.
    ${marketData.newBets} new bets placed in the last hour.
    
    Current odds: Dies before predicted date, ${marketData.odds.before} to one.
    Dies on exact date, ${marketData.odds.exact} to one.
    Dies after predicted date, ${marketData.odds.after} to one.
    
    Place your bets now. Death waits for no one.
  `;

  try {
    const audioUrl = await generateVoice(text, 'grim_reaper');
    await playAudio(audioUrl);
    return audioUrl;
  } catch (error) {
    console.error('Market announcement failed:', error);
    throw error;
  }
};

export const lifeExtensionCelebration = async (extension) => {
  const text = `
    Congratulations! You have successfully purchased ${extension.daysAdded} additional days of life.
    Your new death date is ${new Date(extension.newDeathDate).toLocaleDateString()}.
    
    Remember, this is only a temporary reprieve.
    Death always collects its due.
    
    Thank you for choosing DeathCast Premium.
  `;

  try {
    const audioUrl = await generateVoice(text, 'friendly_death');
    await playAudio(audioUrl);
    return audioUrl;
  } catch (error) {
    console.error('Life extension celebration failed:', error);
    throw error;
  }
};