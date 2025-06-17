// Sound effects library for DeathCast
// Using Web Audio API for dramatic sound effects

class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.init();
  }

  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('Audio context initialized');
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  // Create heartbeat sound using oscillators
  createHeartbeat() {
    if (!this.audioContext) return null;

    const duration = 0.8;
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Create heartbeat pattern
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      
      // Two beats pattern
      let amplitude = 0;
      if (t < 0.1) {
        amplitude = Math.sin(t * Math.PI * 50) * Math.exp(-t * 20);
      } else if (t > 0.2 && t < 0.3) {
        amplitude = Math.sin((t - 0.2) * Math.PI * 40) * Math.exp(-(t - 0.2) * 15);
      }
      
      data[i] = amplitude * 0.3;
    }

    return buffer;
  }

  // Create dramatic scan sound
  createScanSound() {
    if (!this.audioContext) return null;

    const duration = 2.0;
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      
      // Rising frequency sweep
      const frequency = 200 + (t / duration) * 800;
      const amplitude = Math.sin(t * Math.PI * frequency) * Math.exp(-t * 0.5) * 0.2;
      
      data[i] = amplitude;
    }

    return buffer;
  }

  // Create ominous drone
  createOminousDrone() {
    if (!this.audioContext) return null;

    const duration = 5.0;
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      
      // Low frequency drone with harmonics
      const fundamental = Math.sin(t * Math.PI * 2 * 60);
      const harmonic1 = Math.sin(t * Math.PI * 2 * 120) * 0.5;
      const harmonic2 = Math.sin(t * Math.PI * 2 * 180) * 0.25;
      
      const amplitude = (fundamental + harmonic1 + harmonic2) * 0.1;
      data[i] = amplitude;
    }

    return buffer;
  }

  // Create death bell toll
  createDeathBell() {
    if (!this.audioContext) return null;

    const duration = 3.0;
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      
      // Bell-like sound with decay
      const frequency = 220;
      const amplitude = Math.sin(t * Math.PI * 2 * frequency) * Math.exp(-t * 2) * 0.3;
      
      data[i] = amplitude;
    }

    return buffer;
  }

  // Play a sound buffer
  async playBuffer(buffer, volume = 1.0) {
    if (!this.audioContext || !buffer) return;

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      
      return new Promise((resolve) => {
        source.onended = resolve;
      });
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  // Play sound with fade in/out
  async playWithFade(buffer, volume = 1.0, fadeTime = 0.5) {
    if (!this.audioContext || !buffer) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      
      // Set up fade in
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + fadeTime);
      
      // Set up fade out
      const fadeOutStart = this.audioContext.currentTime + buffer.duration - fadeTime;
      gainNode.gain.setValueAtTime(volume, fadeOutStart);
      gainNode.gain.linearRampToValueAtTime(0, fadeOutStart + fadeTime);
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      
      return new Promise((resolve) => {
        source.onended = resolve;
      });
    } catch (error) {
      console.warn('Audio playback with fade failed:', error);
    }
  }
}

// Create global instance
const soundEffects = new SoundEffects();

// Export functions for easy use
export const playDramaticSound = async (soundType, volume = 0.7) => {
  let buffer;
  
  switch (soundType) {
    case 'heartbeat':
      buffer = soundEffects.createHeartbeat();
      break;
    case 'scan':
      buffer = soundEffects.createScanSound();
      break;
    case 'drone':
      buffer = soundEffects.createOminousDrone();
      break;
    case 'bell':
      buffer = soundEffects.createDeathBell();
      break;
    default:
      console.warn(`Unknown sound type: ${soundType}`);
      return;
  }
  
  if (buffer) {
    await soundEffects.playBuffer(buffer, volume);
  }
};

export const playHeartbeat = async (volume = 0.5) => {
  const buffer = soundEffects.createHeartbeat();
  if (buffer) {
    // Play heartbeat in a loop for dramatic effect
    for (let i = 0; i < 3; i++) {
      await soundEffects.playBuffer(buffer, volume);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
};

export const playScanningSound = async (volume = 0.3) => {
  const buffer = soundEffects.createScanSound();
  if (buffer) {
    await soundEffects.playWithFade(buffer, volume, 0.3);
  }
};

export const playOminousDrone = async (volume = 0.2) => {
  const buffer = soundEffects.createOminousDrone();
  if (buffer) {
    await soundEffects.playWithFade(buffer, volume, 1.0);
  }
};

export const playDeathBell = async (volume = 0.4) => {
  const buffer = soundEffects.createDeathBell();
  if (buffer) {
    await soundEffects.playBuffer(buffer, volume);
  }
};

// Play notification sound using simple beep
export const playNotification = async () => {
  if (!soundEffects.audioContext) return;
  
  try {
    if (soundEffects.audioContext.state === 'suspended') {
      await soundEffects.audioContext.resume();
    }

    const oscillator = soundEffects.audioContext.createOscillator();
    const gainNode = soundEffects.audioContext.createGain();
    
    oscillator.frequency.setValueAtTime(800, soundEffects.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, soundEffects.audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, soundEffects.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, soundEffects.audioContext.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(soundEffects.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(soundEffects.audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('Notification sound failed:', error);
  }
};

// Initialize audio context on user interaction
export const initAudio = async () => {
  if (soundEffects.audioContext && soundEffects.audioContext.state === 'suspended') {
    await soundEffects.audioContext.resume();
  }
};

export default soundEffects;
