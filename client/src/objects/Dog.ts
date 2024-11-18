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

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 0.1, 0.15);
    rightEye.position.set(0.1, 0.1, 0.15);
    leftEye.castShadow = true;
    rightEye.castShadow = true;
    head.add(leftEye);
    head.add(rightEye);

    // Snout with nose
    const snoutGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.3);
    const snout = new THREE.Mesh(snoutGeometry, this.bodyMaterial);
    snout.position.set(0, -0.05, 0.2);
    snout.castShadow = true;
    const noseGeometry = new THREE.SphereGeometry(0.05);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0, 0.15);
    nose.castShadow = true;
    snout.add(nose);
    head.add(snout);

    // Ears
    const earGeometry = new THREE.ConeGeometry(0.1, 0.2, 4);
    const leftEar = new THREE.Mesh(earGeometry, this.bodyMaterial);
    const rightEar = new THREE.Mesh(earGeometry, this.bodyMaterial);
    leftEar.position.set(-0.15, 0.3, 0);
    rightEar.position.set(0.15, 0.3, 0);
    leftEar.rotation.x = -Math.PI * 0.1;
    rightEar.rotation.x = -Math.PI * 0.1;
    leftEar.castShadow = true;
    rightEar.castShadow = true;
    head.add(leftEar);
    head.add(rightEar);

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
        
        // Reset rotations and positions when walking
        this.dogBody.rotation.x = 0;
        const head = this.dogBody.children[1];
        head.rotation.x = 0;
        
        // Leg animation
        const walkSpeed = 3;
        const legAnimationHeight = 0.15;
        
        this.dogBody.children.slice(2).forEach((leg, index) => {
          const legPhase = (currentTime * walkSpeed + (index * Math.PI / 2)) % (Math.PI * 2);
          leg.position.y = this.dogHeight / 2 - 0.2 + Math.sin(legPhase) * legAnimationHeight;
          // Reset leg positions
          leg.position.z = index < 2 ? 0.4 : -0.4; // Front/back legs
        });
      }
      // Phase 2: Stand up (2-3s)
      else if (elapsedTime < 3) {
        const standT = (elapsedTime - 2);
        const easeStandT = standT * standT * (3 - 2 * standT);
        
        // Rotate body up
        this.dogBody.rotation.x = -easeStandT * Math.PI / 3;
        
        // Adjust front legs
        const frontLegs = [this.dogBody.children[2], this.dogBody.children[3]];
        frontLegs.forEach(leg => {
          leg.position.y = (this.dogHeight / 2 - 0.2) + easeStandT * 0.4;
          leg.position.z = 0.4 + easeStandT * 0.3;
        });
        
        // Adjust head to look up
        const head = this.dogBody.children[1];
        head.rotation.x = -easeStandT * Math.PI / 6;
      }
      // Phase 3-4: Wait for door (3-5s)
      else if (elapsedTime < 5) {
        // Maintain standing pose
        this.dogBody.rotation.x = -Math.PI / 3;
        const head = this.dogBody.children[1];
        head.rotation.x = -Math.PI / 6;
        
        // Keep front legs extended
        const frontLegs = [this.dogBody.children[2], this.dogBody.children[3]];
        frontLegs.forEach(leg => {
          leg.position.y = this.dogHeight / 2 - 0.2 + 0.4;
          leg.position.z = 0.4 + 0.3;
        });
        
        // Add slight idle animation
        const idleT = Math.sin(elapsedTime * 2) * 0.02;
        this.dogBody.position.y = 0.1 + idleT;
      }
      // Phase 5: Return to start (5-7s)
      else if (elapsedTime >= 5) {
        const returnT = (elapsedTime - 5) / 2;
        const easeReturnT = returnT * returnT * (3 - 2 * returnT);
        
        // Gradually return body and head rotation to normal
        this.dogBody.rotation.x = -(1 - easeReturnT) * Math.PI / 3;
        const head = this.dogBody.children[1];
        head.rotation.x = -(1 - easeReturnT) * Math.PI / 6;
        
        // Move back to start
        this.dogBody.position.x = 2 - easeReturnT * 5;
        this.dogBody.position.z = -easeReturnT * 2;
        this.dogBody.position.y = 0.1;
        
        // Return legs to normal positions with walking animation
        const walkSpeed = 3;
        const legAnimationHeight = 0.15;
        
        this.dogBody.children.slice(2).forEach((leg, index) => {
          const legPhase = (currentTime * walkSpeed + (index * Math.PI / 2)) % (Math.PI * 2);
          leg.position.y = this.dogHeight / 2 - 0.2 + Math.sin(legPhase) * legAnimationHeight;
          // Smoothly transition front legs back
          if (index < 2) {
            leg.position.z = 0.4 + (1 - easeReturnT) * 0.3;
            leg.position.y = (this.dogHeight / 2 - 0.2) + (1 - easeReturnT) * 0.4 + Math.sin(legPhase) * legAnimationHeight;
          }
        });
      }
    }
  }

  public getDogBody(): THREE.Group {
    return this.dogBody;
  }
}
