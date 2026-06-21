
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Context is initialized on first user interaction to comply with browser policies
  }

  private init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.setVolume(0.3);
  }

  public setVolume(vol: number) {
    this.init();
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : vol, this.ctx!.currentTime, 0.05);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.isMuted ? 0 : 0.3);
    return this.isMuted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.5, slideTo?: number) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playClick() {
    this.playTone(800, 'sine', 0.1, 0.2, 400);
  }

  public playSuccess() {
    this.playTone(400, 'square', 0.3, 0.15, 800);
  }

  public playError() {
    this.playTone(150, 'sawtooth', 0.4, 0.2, 50);
  }

  public playScore() {
    this.playTone(600, 'triangle', 0.2, 0.3);
    setTimeout(() => this.playTone(900, 'triangle', 0.2, 0.2), 100);
  }

  public playWhoosh() {
    this.playTone(200, 'sine', 0.4, 0.1, 1200);
  }

  public playBounce() {
    this.playTone(100, 'sine', 0.15, 0.3, 40);
  }

  public playType() {
    this.playTone(Math.random() * 100 + 400, 'sine', 0.05, 0.05);
  }
}

export const audio = new AudioManager();
