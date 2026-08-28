// Web Audio API and Web Speech API helper for child-friendly audio feedback

class SoundEngine {
  private audioCtx: AudioContext | null = null;

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play a bubble pop / placement sound
  playPop() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio fallback silent
    }
  }

  // Play an item remove / swoosh sound
  playRemove() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio fallback silent
    }
  }

  // Play progressive step chime when counting (step 1 -> pitch 1, step 2 -> pitch 2, etc.)
  playCountChime(step: number = 1) {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pentatonic / pleasant scale frequencies
      const baseFreqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const freq = baseFreqs[(step - 1) % baseFreqs.length] * Math.pow(1.05, Math.floor((step - 1) / baseFreqs.length));

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio fallback silent
    }
  }

  // Play realistic crowd applause / clapping sound synthesis using filtered noise bursts
  playApplause() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;

      // Create multiple noise bursts resembling enthusiastic crowd clapping
      const totalClaps = 35;
      const duration = 2.2;

      // Noise buffer for clap generator
      const bufferSize = ctx.sampleRate * 0.05; // 50ms clap transient
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      for (let i = 0; i < totalClaps; i++) {
        // distribute claps randomly over the duration
        const startTime = ctx.currentTime + Math.random() * (duration - 0.2);
        const clapSource = ctx.createBufferSource();
        clapSource.buffer = noiseBuffer;

        // Bandpass filter to shape clap frequency
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000 + Math.random() * 800, startTime);
        filter.Q.setValueAtTime(2.5, startTime);

        const gain = ctx.createGain();
        const clapVolume = 0.08 + Math.random() * 0.12;
        gain.gain.setValueAtTime(clapVolume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.045);

        clapSource.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        clapSource.start(startTime);
        clapSource.stop(startTime + 0.05);
      }

      // Add cheerful ascending glockenspiel fanfare over the clapping
      const fanfareNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
      fanfareNotes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        const noteTime = ctx.currentTime + 0.15 + index * 0.12;
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.2, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });
    } catch {
      // Audio fallback silent
    }
  }

  // Play crisp magical star pop chime with sparkle overtone (for star 1, 2, 3)
  playStarPop(starIndex: number = 1) {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;

      const basePitches = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
      const pitch = basePitches[Math.min(starIndex - 1, basePitches.length - 1)] || 880;

      // Main chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);

      // Harmonious sparkle overtone
      const sparkleOsc = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      sparkleOsc.type = 'triangle';
      sparkleOsc.frequency.setValueAtTime(pitch * 2, ctx.currentTime + 0.05);

      sparkleGain.gain.setValueAtTime(0.2, ctx.currentTime + 0.05);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(ctx.destination);

      sparkleOsc.start(ctx.currentTime + 0.05);
      sparkleOsc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio fallback silent
    }
  }

  // Play victory fanfare on correct answer
  playVictory() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.1);
        osc.stop(ctx.currentTime + index * 0.1 + 0.35);
      });
    } catch {
      // Audio fallback silent
    }
  }

  // Play soft retry sound
  playTryAgain() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio fallback silent
    }
  }

  // Duolingo-style Signature Correct Chime (happy dual ding C6 -> G6)
  playDuoCorrect() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;

      // Note 1: High crisp ding
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.22);

      // Note 2: Higher bright resolution
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1); // B5
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.45);
    } catch {
      // silent
    }
  }

  // Duolingo-style Soft Wrong Buzzer (friendly low boop-boop)
  playDuoWrong() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(260, ctx.currentTime);
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(196, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.3);
    } catch {
      // silent
    }
  }

  // Gem / Star collection chime
  playGem() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // silent
    }
  }

  // Heart deduction sound
  playHeartLost() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // silent
    }
  }

  // Button tactile click
  playClick() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // silent
    }
  }

  // Speech pronunciation for Arabic / English numbers and praise
  speak(text: string, lang: 'ar' | 'en' = 'ar') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Friendly slightly slower pace for kids
      utterance.pitch = 1.2; // Cheerful friendly pitch

      const voices = window.speechSynthesis.getVoices();
      if (lang === 'ar') {
        utterance.lang = 'ar-SA';
        const arVoice = voices.find((v) => v.lang.startsWith('ar'));
        if (arVoice) utterance.voice = arVoice;
      } else {
        utterance.lang = 'en-US';
        const enVoice = voices.find((v) => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Silent catch
    }
  }
}

export const soundManager = new SoundEngine();

// Numbers in Arabic words
export const ARABIC_NUMBER_WORDS: Record<number, string> = {
  0: 'صفر',
  1: 'واحد',
  2: 'اثنان',
  3: 'ثلاثة',
  4: 'أربعة',
  5: 'خمسة',
  6: 'ستة',
  7: 'سبعة',
  8: 'ثمانية',
  9: 'تسعة',
  10: 'عشرة',
  11: 'أحد عشر',
  12: 'اثنا عشر',
  13: 'ثلاثة عشر',
  14: 'أربعة عشر',
  15: 'خمسة عشر',
  16: 'ستة عشر',
  17: 'سبعة عشر',
  18: 'ثمانية عشر',
  19: 'تسعة عشر',
  20: 'عشرون',
  24: 'أربعة وعشرون',
  30: 'ثلاثون',
  36: 'ستة وثلاثون',
  40: 'أربعون',
  50: 'خمسون',
  100: 'مئة',
};

// Encouraging praise phrases in Arabic
export const PRAISE_PHRASES_AR = [
  'أحسنت يا بطل!',
  'رائع جداً!',
  'ممتاز يا عبقري!',
  'إجابة صحيحة وذكية!',
  'عمل مذهل!',
  'أنت نجم الرياضيات اليوم!',
  'برافو عليك!',
];

export const PRAISE_PHRASES_EN = [
  'Awesome job, champion!',
  'Super smart!',
  'Brilliant answer!',
  'You are a Math Star!',
  'Great work!',
  'Fantastic job!',
];
