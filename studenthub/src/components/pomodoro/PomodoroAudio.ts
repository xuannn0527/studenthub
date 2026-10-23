// Web Audio API 音效與環境音引擎（完全離線可用，無 CORS 與外部依賴問題）

export type AmbientSoundType = "rain" | "birds" | "cafe" | "waves" | "lofi";

class PomodoroAudioEngine {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType | null = null;
  private isPlaying = false;
  private volume = 0.5;

  // 節點引用
  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private lofiInterval: number | null = null;
  private birdsInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume() {
    return this.volume;
  }

  public playSound(type: AmbientSoundType) {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.stopSound();
    this.currentType = type;
    this.isPlaying = true;

    switch (type) {
      case "rain":
        this.startRain();
        break;
      case "birds":
        this.startBirds();
        break;
      case "cafe":
        this.startCafe();
        break;
      case "waves":
        this.startWaves();
        break;
      case "lofi":
        this.startLofi();
        break;
    }
  }

  public stopSound() {
    this.isPlaying = false;
    if (this.lofiInterval) {
      window.clearInterval(this.lofiInterval);
      this.lofiInterval = null;
    }
    if (this.birdsInterval) {
      window.clearInterval(this.birdsInterval);
      this.birdsInterval = null;
    }

    this.activeNodes.forEach((n) => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch {}
    });
    this.activeNodes = [];
  }

  public toggle(type: AmbientSoundType) {
    if (this.isPlaying && this.currentType === type) {
      this.stopSound();
      return false;
    } else {
      this.playSound(type);
      return true;
    }
  }

  public isSoundPlaying() {
    return this.isPlaying;
  }

  public getCurrentSound() {
    return this.currentType;
  }

  // 產生白噪音緩衝
  private createNoiseBuffer(seconds = 5): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not ready");
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // 粉紅噪音濾波近似
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  // 1. 窗外雨聲
  private startRain() {
    if (!this.ctx || !this.masterGain) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(5);
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }

  // 2. 岸邊海浪 (週期性漲潮與落潮)
  private startWaves() {
    if (!this.ctx || !this.masterGain) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(6);
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    // LFO 控制潮汐起伏 (週期 ~7 秒)
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.14, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    lfo.start();
    noise.start();
    this.activeNodes.push(noise, filter, waveGain, lfo, lfoGain);
  }

  // 3. 森林鳥鳴 (底噪風聲 + 定時鳥鳴)
  private startBirds() {
    if (!this.ctx || !this.masterGain) return;

    // 微風森林底噪
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(4);
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise, filter, gain);

    // 隨機鳥鳴觸發
    const chirp = () => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const chirpGain = this.ctx.createGain();

      osc.type = "sine";
      const baseFreq = 2200 + Math.random() * 1200;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 800, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 300, t + 0.16);

      chirpGain.gain.setValueAtTime(0, t);
      chirpGain.gain.linearRampToValueAtTime(0.2, t + 0.04);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(chirpGain);
      chirpGain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.25);
    };

    chirp();
    this.birdsInterval = window.setInterval(() => {
      if (Math.random() > 0.3) chirp();
    }, 2800);
  }

  // 4. 咖啡廳環境音 (柔和低頻嗡嗡 + 輕微杯盤聲)
  private startCafe() {
    if (!this.ctx || !this.masterGain) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(5);
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }

  // 5. Lofi 輕音樂 (溫暖復古電鋼琴和弦循環)
  private startLofi() {
    if (!this.ctx || !this.masterGain) return;

    // 和弦進行: Cmaj7 -> Am7 -> Dm7 -> G7
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      notes.forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(900, t);

        noteGain.gain.setValueAtTime(0, t);
        noteGain.gain.linearRampToValueAtTime(0.08, t + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 3.0);
      });
    };

    playChord();
    this.lofiInterval = window.setInterval(playChord, 3200);
  }

  // 🔔 專注完成 / 休息結束 溫馨雙音鍾聲
  public playChime(type: "complete" | "rest_end" = "complete") {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const freqs = type === "complete" ? [523.25, 659.25, 783.99] : [659.25, 523.25];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + idx * 0.18);

      gain.gain.setValueAtTime(0, t + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.3, t + idx * 0.18 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.18 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.18);
      osc.stop(t + idx * 0.18 + 1.3);
    });
  }
}

export const pomodoroAudio = new PomodoroAudioEngine();
