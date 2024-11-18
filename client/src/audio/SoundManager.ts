export class SoundManager {
  private audioContext: AudioContext;
  private walkingInterval: number | null = null;
  private isWalking: boolean = false;
  private nodes: AudioNode[] = [];

  constructor() {
    this.audioContext = new AudioContext();
  }

  private createFootstepSound(): void {
    // Thump oscillator for impact
    const thumpOsc = this.audioContext.createOscillator();
    thumpOsc.frequency.setValueAtTime(60, this.audioContext.currentTime);
    thumpOsc.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.1);

    // Thump envelope
    const thumpGain = this.audioContext.createGain();
    thumpGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    thumpGain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    // Surface contact noise
    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;

    // Noise envelope
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

    // Connect nodes
    thumpOsc.connect(thumpGain);
    thumpGain.connect(this.audioContext.destination);
    noise.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);

    // Start sounds
    thumpOsc.start();
    noise.start();

    // Store nodes for cleanup
    this.nodes.push(thumpOsc, thumpGain, noiseGain);

    // Stop after duration
    setTimeout(() => {
      thumpOsc.stop();
      noise.stop();
      this.nodes = this.nodes.filter(node => node !== thumpOsc && node !== thumpGain && node !== noiseGain);
    }, 300);
  }

  private createDoorSound(): void {
    // Creaking sweep oscillator
    const creakOsc = this.audioContext.createOscillator();
    creakOsc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    creakOsc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 1.0);

    // Creak envelope
    const creakGain = this.audioContext.createGain();
    creakGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    creakGain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.1);
    creakGain.gain.setValueAtTime(0.15, this.audioContext.currentTime + 0.8);
    creakGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1.0);

    // Low frequency resonance
    const resonanceOsc = this.audioContext.createOscillator();
    resonanceOsc.frequency.setValueAtTime(50, this.audioContext.currentTime);

    const resonanceGain = this.audioContext.createGain();
    resonanceGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    resonanceGain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
    resonanceGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1.0);

    // Contact noise burst
    const burstBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
    const burstData = burstBuffer.getChannelData(0);
    for (let i = 0; i < burstBuffer.length; i++) {
      burstData[i] = Math.random() * 2 - 1;
    }

    const burst = this.audioContext.createBufferSource();
    burst.buffer = burstBuffer;

    const burstGain = this.audioContext.createGain();
    burstGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    burstGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.02);
    burstGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

    // Connect all nodes
    creakOsc.connect(creakGain);
    creakGain.connect(this.audioContext.destination);
    resonanceOsc.connect(resonanceGain);
    resonanceGain.connect(this.audioContext.destination);
    burst.connect(burstGain);
    burstGain.connect(this.audioContext.destination);

    // Start sounds
    creakOsc.start();
    resonanceOsc.start();
    burst.start();

    // Store nodes for cleanup
    this.nodes.push(creakOsc, creakGain, resonanceOsc, resonanceGain, burstGain);

    // Stop after duration
    setTimeout(() => {
      creakOsc.stop();
      resonanceOsc.stop();
      this.nodes = this.nodes.filter(node => 
        node !== creakOsc && node !== creakGain && 
        node !== resonanceOsc && node !== resonanceGain && 
        node !== burstGain
      );
    }, 1000);
  }

  public async startWalking() {
    if (this.isWalking) return;
    
    // Resume AudioContext if it's suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isWalking = true;
    const stepInterval = 400; // Time between steps in milliseconds

    const playStep = () => {
      if (this.isWalking) {
        this.createFootstepSound();
      }
    };

    playStep(); // Play first step immediately
    this.walkingInterval = window.setInterval(playStep, stepInterval);
  }

  public stopWalking() {
    this.isWalking = false;
    if (this.walkingInterval !== null) {
      clearInterval(this.walkingInterval);
      this.walkingInterval = null;
    }
  }

  public async playDoorSound() {
    // Resume AudioContext if it's suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.createDoorSound();
  }

  public stopAllSounds() {
    this.stopWalking();
    
    // Disconnect and clean up all audio nodes
    this.nodes.forEach(node => {
      try {
        node.disconnect();
        if (node instanceof OscillatorNode) {
          node.stop();
        }
      } catch (error) {
        console.warn('Error cleaning up audio node:', error);
      }
    });
    this.nodes = [];
  }
}
