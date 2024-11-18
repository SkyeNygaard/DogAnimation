import * as THREE from 'three';

export class Dog {
  private dogBody: THREE.Group;
  private scene: THREE.Scene;
  private bodyMaterial: THREE.MeshStandardMaterial;
  private dogHeight: number = 1.2;

  constructor(scene: THREE.Scene, material?: THREE.MeshStandardMaterial) {
    this.scene = scene;
    this.bodyMaterial = material || new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.7,
      metalness: 0.2
    });
    this.dogBody = this.createDog();
    this.scene.add(this.dogBody);
  }

  private createDog(): THREE.Group {
    const dogBody = new THREE.Group();
      
    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 0.6, 1.2);
    const body = new THREE.Mesh(bodyGeometry, this.bodyMaterial);
    body.position.y = this.dogHeight / 2;
    body.castShadow = true;
    dogBody.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const head = new THREE.Mesh(headGeometry, this.bodyMaterial);
    head.position.set(0, this.dogHeight / 2 + 0.3, 0.6);
    head.castShadow = true;
    dogBody.add(head);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const legPositions = [
      [-0.3, -0.2, 0.4],  // Front Left
      [0.3, -0.2, 0.4],   // Front Right
      [-0.3, -0.2, -0.4], // Back Left
      [0.3, -0.2, -0.4]   // Back Right
    ];

    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeometry, this.bodyMaterial);
      leg.position.set(x, this.dogHeight / 2 + y, z);
      leg.castShadow = true;
      dogBody.add(leg);
    });

    // Set initial position
    dogBody.position.set(-3, 0.1, -2);
    return dogBody;
  }

  public animateWalking(currentTime: number, elapsedTime: number, phase: number): void {
    if (phase < 1) {
      // Phase 1: Walk to door (0-2s)
      if (elapsedTime < 2) {
        const t = elapsedTime / 2;
        const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        // Move dog towards door
        this.dogBody.position.x = -3 + easeT * 5;
        this.dogBody.position.z = -2 + easeT * 2;
        
        // Leg animation
        const walkSpeed = 3;
        const legAnimationHeight = 0.15;
        
        this.dogBody.children.slice(2).forEach((leg, index) => {
          const legPhase = (currentTime * walkSpeed + (index * Math.PI / 2)) % (Math.PI * 2);
          leg.position.y = this.dogHeight / 2 - 0.2 + Math.sin(legPhase) * legAnimationHeight;
        });
      }
      // Phase 2: At door (2-3s)
      else if (elapsedTime < 3) {
        const head = this.dogBody.children[1];
        const headBobT = ((elapsedTime - 2) * Math.PI * 2);
        head.position.y = this.dogHeight / 2 + 0.3 + Math.sin(headBobT) * 0.05;
      }
      // Phase 5: Return to start (5-7s)
      else if (elapsedTime >= 5) {
        const returnT = (elapsedTime - 5) / 2;
        const easeReturnT = returnT * returnT * (3 - 2 * returnT);
        
        // Move back to start
        this.dogBody.position.x = 2 - easeReturnT * 5;
        this.dogBody.position.z = -easeReturnT * 2;
        
        // Leg animation during return
        const walkSpeed = 3;
        const legAnimationHeight = 0.15;
        
        this.dogBody.children.slice(2).forEach((leg, index) => {
          const legPhase = (currentTime * walkSpeed + (index * Math.PI / 2)) % (Math.PI * 2);
          leg.position.y = this.dogHeight / 2 - 0.2 + Math.sin(legPhase) * legAnimationHeight;
        });
      }
    }
  }

  public getDogBody(): THREE.Group {
    return this.dogBody;
  }
}
