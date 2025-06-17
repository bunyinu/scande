import React, { useState } from 'react';
import { generateVoice, playAudio, deathVoices, stopCurrentAudio } from '../lib/elevenlabs';
import './VoiceSelector.css';

export default function VoiceSelector({ onVoiceSelect, selectedVoice = 'grim_reaper' }) {
  const [playingVoice, setPlayingVoice] = useState(null);

  const testVoice = async (voiceType) => {
    if (playingVoice) return;

    // Stop any currently playing audio
    stopCurrentAudio();
    setPlayingVoice(voiceType);

    try {
      const testMessages = {
        'grim_reaper': 'I am Death incarnate. Your time has come, mortal.',
        'friendly_death': 'Hi there! I\'m here to cheerfully announce your death!',
        'game_show_host': 'Welcome to Death or No Death! You\'ve won... death!',
        'news_anchor': 'Breaking news: Local person predicted to die soon.',
        'british_butler': 'I regret to inform you of your impending demise, sir.',
        'sports_commentator': 'And death scores! What an incredible play!',
        'movie_trailer': 'In a world where everyone dies... one person will die.',
        'robot_ai': 'MORTALITY ANALYSIS COMPLETE. TERMINATION IMMINENT.',
        'valley_girl': 'OMG, you\'re like, totally gonna die! That\'s so random!',
        'pirate_captain': 'Ahoy! Ye be sailin\' to Davy Jones\' locker, matey!',
        'southern_preacher': 'Repent! For your time on this earth is numbered!',
        'philosopher': 'Death is but a transition to the next phase of existence.'
      };

      const message = testMessages[voiceType] || testMessages['grim_reaper'];
      const audioUrl = await generateVoice(message, voiceType);
      
      if (audioUrl) {
        await playAudio(audioUrl);
      }
      
      if (onVoiceSelect) {
        onVoiceSelect(voiceType);
      }
    } catch (error) {
      console.error('Voice test failed:', error);
    } finally {
      setPlayingVoice(null);
    }
  };

  return (
    <div className="voice-selector">
      <h3 className="voice-selector-title">🎭 Choose Your Death Announcer</h3>
      <div className="voice-grid">
        {Object.entries(deathVoices).map(([voiceKey, voice]) => (
          <button
            key={voiceKey}
            className={`voice-card ${selectedVoice === voiceKey ? 'selected' : ''} ${playingVoice === voiceKey ? 'playing' : ''}`}
            onClick={() => testVoice(voiceKey)}
            disabled={playingVoice !== null}
          >
            <div className="voice-emoji">
              {getVoiceEmoji(voiceKey)}
            </div>
            <div className="voice-name">
              {formatVoiceName(voiceKey)}
            </div>
            <div className="voice-description">
              {voice.description}
            </div>
            <div className="voice-personality">
              {voice.personality}
            </div>
            {playingVoice === voiceKey && (
              <div className="playing-indicator">
                🔊 Playing...
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

const getVoiceEmoji = (voiceKey) => {
  const emojis = {
    'grim_reaper': '💀',
    'friendly_death': '😊',
    'game_show_host': '🎪',
    'news_anchor': '📺',
    'british_butler': '🎩',
    'sports_commentator': '🏆',
    'movie_trailer': '🎬',
    'robot_ai': '🤖',
    'valley_girl': '💅',
    'pirate_captain': '🏴‍☠️',
    'southern_preacher': '⛪',
    'philosopher': '🧠'
  };
  return emojis[voiceKey] || '🎭';
};

const formatVoiceName = (voiceKey) => {
  return voiceKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
