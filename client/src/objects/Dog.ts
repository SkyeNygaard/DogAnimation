import * as THREE from 'three';

export class Dog {
  private dogBody: THREE.Group;
  private scene: THREE.Scene;
  private bodyMaterial: THREE.MeshStandardMaterial;
  private dogHeight: number = 1.2;
  private tail: THREE.Mesh;
  private head: THREE.Mesh;
  private leftEar: THREE.Mesh;
  private rightEar: THREE.Mesh;
  private body: THREE.Mesh;

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
    this.body = new THREE.Mesh(bodyGeometry, this.bodyMaterial);
    this.body.position.y = this.dogHeight / 2;
    this.body.castShadow = true;
    dogBody.add(this.body);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    this.head = new THREE.Mesh(headGeometry, this.bodyMaterial);
    this.head.position.set(0, this.dogHeight / 2 + 0.3, 0.6);
    this.head.castShadow = true;
    dogBody.add(this.head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 0.1, 0.15);
    rightEye.position.set(0.1, 0.1, 0.15);
    leftEye.castShadow = true;
    rightEye.castShadow = true;
    this.head.add(leftEye);
    this.head.add(rightEye);

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
    this.head.add(snout);

    // Ears with improved geometry
    const earGeometry = new THREE.ConeGeometry(0.1, 0.2, 4);
    this.leftEar = new THREE.Mesh(earGeometry, this.bodyMaterial);
    this.rightEar = new THREE.Mesh(earGeometry, this.bodyMaterial);
    this.leftEar.position.set(-0.15, 0.3, 0);
    this.rightEar.position.set(0.15, 0.3, 0);
    this.leftEar.rotation.x = -Math.PI * 0.1;
    this.rightEar.rotation.x = -Math.PI * 0.1;
    this.leftEar.castShadow = true;
    this.rightEar.castShadow = true;
    this.head.add(this.leftEar);
    this.head.add(this.rightEar);

    // Tail
    const tailGeometry = new THREE.CylinderGeometry(0.05, 0.02, 0.4);
    this.tail = new THREE.Mesh(tailGeometry, this.bodyMaterial);
    this.tail.position.set(0, this.dogHeight / 2 + 0.1, -0.6);
    this.tail.rotation.x = Math.PI * 0.25;
    this.tail.castShadow = true;
    dogBody.add(this.tail);

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
        
        // Body sway during walking
        this.body.rotation.z = Math.sin(currentTime * 6) * 0.05;
        
        // Tail wagging during walking
        this.tail.rotation.z = Math.sin(currentTime * 12) * 0.25;
        
        // Head bobbing during walking
        this.head.position.y = this.dogHeight / 2 + 0.3 + Math.sin(currentTime * 6) * 0.05;
        
        // Ear movement during walking
        const earWalkBob = Math.sin(currentTime * 6) * 0.1;
        this.leftEar.rotation.x = -Math.PI * 0.1 + earWalkBob;
        this.rightEar.rotation.x = -Math.PI * 0.1 + earWalkBob;
        
        // Leg animation with improved timing
        const walkSpeed = 6;
        const legAnimationHeight = 0.15;
        
        this.dogBody.children.slice(5).forEach((leg, index) => {
          const offset = index % 2 === 0 ? 0 : Math.PI;
          const legPhase = (currentTime * walkSpeed + offset) % (Math.PI * 2);
          leg.position.y = this.dogHeight / 2 - 0.2 + Math.sin(legPhase) * legAnimationHeight;
          // Add forward/backward motion
          leg.position.z = (index < 2 ? 0.4 : -0.4) + Math.cos(legPhase) * 0.1;
        });
      }
      // Phase 2: Stand up (2-3s)
      else if (elapsedTime < 3) {
        const standT = (elapsedTime - 2);
        const easeStandT = standT * standT * (3 - 2 * standT);
        
        // Rotate body up with subtle bounce
        this.dogBody.rotation.x = -easeStandT * Math.PI / 3;
        
        // Adjust front legs with spread
        const frontLegs = [this.dogBody.children[5], this.dogBody.children[6]];
        frontLegs.forEach((leg, index) => {
          leg.position.y = (this.dogHeight / 2 - 0.2) + easeStandT * 0.4;
          leg.position.z = 0.4 + easeStandT * 0.3;
          // Spread legs slightly
          leg.position.x = (index === 0 ? -0.35 : 0.35) * (1 + easeStandT * 0.2);
        });
        
        // Dynamic head and ear movement during standing
        this.head.rotation.x = -easeStandT * Math.PI / 6;
        const earStandAngle = -Math.PI * 0.15 - easeStandT * Math.PI * 0.1;
        this.leftEar.rotation.x = earStandAngle;
        this.rightEar.rotation.x = earStandAngle;
        
        // Excited tail wagging when standing
        this.tail.rotation.z = Math.sin(currentTime * 15) * 0.3;
        this.tail.rotation.y = Math.cos(currentTime * 15) * 0.3;
      }
      // Phase 3-4: Wait for door (3-5s)
      else if (elapsedTime < 5) {
        // Maintain standing pose with subtle movements
        this.dogBody.rotation.x = -Math.PI / 3;
        
        // Head tilting and looking around
        const headTilt = Math.sin(currentTime * 2) * 0.1;
        const headTurn = Math.cos(currentTime * 1.5) * 0.15;
        this.head.rotation.x = -Math.PI / 6 + headTilt;
        this.head.rotation.y = headTurn;
        
        // Ear reactions to head movement
        this.leftEar.rotation.x = -Math.PI * 0.25 - headTilt * 0.5;
        this.rightEar.rotation.x = -Math.PI * 0.25 - headTilt * 0.5;
        
        // Excited tail wagging
        this.tail.rotation.z = Math.sin(currentTime * 15) * 0.4;
        this.tail.rotation.y = Math.cos(currentTime * 15) * 0.4;
        
        // Subtle body breathing movement
        this.body.scale.y = 1 + Math.sin(currentTime * 3) * 0.02;
        
        // Keep front legs extended with subtle movement
        const frontLegs = [this.dogBody.children[5], this.dogBody.children[6]];
        frontLegs.forEach(leg => {
          leg.position.y = this.dogHeight / 2 - 0.2 + 0.4 + Math.sin(currentTime * 2) * 0.02;
          leg.position.z = 0.4 + 0.3;
        });
      }
      // Phase 5: Return to start (5-7s)
      else if (elapsedTime >= 5) {
        const returnT = (elapsedTime - 5) / 2;
        const easeReturnT = returnT * returnT * (3 - 2 * returnT);
        
        // Smoothly return body and head rotation
        this.dogBody.rotation.x = -(1 - easeReturnT) * Math.PI / 3;
        this.head.rotation.x = -(1 - easeReturnT) * Math.PI / 6;
        this.head.rotation.y = 0;
        
        // Reset ear positions
        this.leftEar.rotation.x = -Math.PI * 0.1;
        this.rightEar.rotation.x = -Math.PI * 0.1;
        
        // Move back to start with body sway
        this.dogBody.position.x = 2 - easeReturnT * 5;
        this.dogBody.position.z = -easeReturnT * 2;
        this.body.rotation.z = Math.sin(currentTime * 6) * 0.05 * (1 - easeReturnT);
        
        // Walking animation for return journey
        const walkSpeed = 6;
        const legAnimationHeight = 0.15;
        
        this.dogBody.children.slice(5).forEach((leg, index) => {
          const offset = index % 2 === 0 ? 0 : Math.PI;
          const legPhase = (currentTime * walkSpeed + offset) % (Math.PI * 2);
          leg.position.y = this.dogHeight / 2 - 0.2 + Math.sin(legPhase) * legAnimationHeight;
          
          if (index < 2) {
            leg.position.z = 0.4 + (1 - easeReturnT) * 0.3;
            leg.position.x = (index === 0 ? -0.3 : 0.3) * (1 + (1 - easeReturnT) * 0.2);
          }
        });
        
        // Tail animation during return
        this.tail.rotation.z = Math.sin(currentTime * 12) * 0.25;
        this.tail.rotation.y = 0;
      }
    }
  }

  public getDogBody(): THREE.Group {
    return this.dogBody;
  }
}
