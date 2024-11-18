export class SoundManager {
  private audioContext: AudioContext;
  private walkingInterval: number | null = null;
  private isWalking: boolean = false;

  constructor() {
    this.audioContext = new AudioContext();
  }

  private createFootstepSound(): void {
    // Simple thump sound
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  private createDoorSound(): void {
    // Simple door creak
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  public async startWalking() {
    if (this.isWalking) return;
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.isWalking = true;
    this.createFootstepSound();
    this.walkingInterval = window.setInterval(() => {
      if (this.isWalking) {
        this.createFootstepSound();
      }
    }, 400);
  }

  public stopWalking() {
    this.isWalking = false;
    if (this.walkingInterval !== null) {
      clearInterval(this.walkingInterval);
      this.walkingInterval = null;
    }
  }

  public async playDoorSound() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.createDoorSound();
  }

  public stopAllSounds() {
    this.stopWalking();
  }
}