import { Howl } from 'howler';

export class SoundManager {
  private walkingSound: Howl;
  private doorSound: Howl;
  private isWalkingPlaying: boolean = false;

  constructor() {
    this.walkingSound = new Howl({
      src: ['/sounds/walking.mp3'],
      volume: 0.5,
      loop: true,
      rate: 1.2
    });

    this.doorSound = new Howl({
      src: ['/sounds/door.mp3'],
      volume: 0.7,
      loop: false
    });
  }

  public startWalking() {
    if (!this.isWalkingPlaying) {
      this.walkingSound.play();
      this.isWalkingPlaying = true;
    }
  }

  public stopWalking() {
    if (this.isWalkingPlaying) {
      this.walkingSound.stop();
      this.isWalkingPlaying = false;
    }
  }

  public playDoorSound() {
    this.doorSound.play();
  }

  public stopAllSounds() {
    this.walkingSound.stop();
    this.doorSound.stop();
    this.isWalkingPlaying = false;
  }
}
