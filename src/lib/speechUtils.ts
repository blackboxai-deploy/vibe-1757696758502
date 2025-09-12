// Speech Recognition and Synthesis Utilities

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

// Check if speech recognition is supported
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// Check if speech synthesis is supported
export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

// Create speech recognition instance
export const createSpeechRecognition = (): any | null => {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Configure recognition settings
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  return recognition;
};

// Get available voices for speech synthesis
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSynthesisSupported()) return [];
  return speechSynthesis.getVoices();
};

// Speak text using speech synthesis
export const speakText = (
  text: string, 
  options: {
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisSupported()) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice options
    utterance.voice = options.voice || null;
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Handle events
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

    // Speak the text
    speechSynthesis.speak(utterance);
  });
};

// Stop current speech synthesis
export const stopSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    speechSynthesis.cancel();
  }
};

// Get preferred voice (English, female if available)
export const getPreferredVoice = (): SpeechSynthesisVoice | null => {
  const voices = getAvailableVoices();
  
  // Try to find a good English voice
  const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
  
  // Prefer female voices
  const femaleVoice = englishVoices.find(voice => 
    voice.name.toLowerCase().includes('female') ||
    voice.name.toLowerCase().includes('samantha') ||
    voice.name.toLowerCase().includes('karen') ||
    voice.name.toLowerCase().includes('susan')
  );
  
  if (femaleVoice) return femaleVoice;
  
  // Fall back to any English voice
  return englishVoices[0] || voices[0] || null;
};

// Audio level detection for visualization
export class AudioLevelDetector {
  private animationId: number | null = null;

  async initialize(): Promise<void> {
    // Simplified initialization - just return success
    return Promise.resolve();
  }

  getAudioLevel(): number {
    // Return a simple simulated audio level for visualization
    return Math.random() * 0.5 + 0.1;
  }

  startMonitoring(callback: (level: number) => void): void {
    const monitor = () => {
      const level = this.getAudioLevel();
      callback(level);
      this.animationId = requestAnimationFrame(monitor);
    };
    monitor();
  }

  stopMonitoring(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  cleanup(): void {
    this.stopMonitoring();
  }
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}