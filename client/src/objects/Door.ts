import * as THREE from 'three';

export class Door {
  private doorGroup: THREE.Group;
  private doorPanelGroup: THREE.Group;
  private knobGroup: THREE.Group;
  private scene: THREE.Scene;
  private woodTexture: THREE.DataTexture;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.woodTexture = this.createWoodTexture();
    this.doorGroup = new THREE.Group();
    this.doorPanelGroup = new THREE.Group();
    this.knobGroup = this.createKnob();
    this.createDoor();
    this.scene.add(this.doorGroup);
  }

  private createWoodTexture(): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const stride = i * 4;
      const noise = Math.random() * 0.2 + 0.8;
      const grain = Math.sin((i % size) * 0.1) * 0.1 + 0.9;
      const color = new THREE.Color(0x5D4037).multiplyScalar(noise * grain);
      data[stride] = Math.floor(color.r * 255);
      data[stride + 1] = Math.floor(color.g * 255);
      data[stride + 2] = Math.floor(color.b * 255);
      data[stride + 3] = 255;
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }

  private createKnob(): THREE.Group {
    const knobGroup = new THREE.Group();
    const knobMaterial = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0,
      roughness: 0.3,
      metalness: 0.8
    });

    // Base
    const knobBaseGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16);
    const knobBase = new THREE.Mesh(knobBaseGeometry, knobMaterial);
    knobBase.rotation.z = Math.PI / 2;
    knobGroup.add(knobBase);

    // Handle
    const knobHandleGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const knobHandle = new THREE.Mesh(knobHandleGeometry, knobMaterial);
    knobHandle.position.x = 0.1;
    knobGroup.add(knobHandle);

    return knobGroup;
  }

  private createDoor(): void {
    const frameDepth = 0.2;
    const frameWidth = 2.2;
    const frameHeight = 3.2;
    const doorWidth = 1.8;
    const doorHeight = 3.0;
    const doorDepth = 0.1;

    // Frame material
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x5D4037,
      roughness: 0.7,
      metalness: 0.1,
      map: this.woodTexture,
      normalMap: this.woodTexture,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughnessMap: this.woodTexture
    });

    // Frame
    const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = frameHeight / 2;
    frame.castShadow = true;
    frame.receiveShadow = true;
    this.doorGroup.add(frame);

    // Door material
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.1,
      map: this.woodTexture,
      normalMap: this.woodTexture,
      normalScale: new THREE.Vector2(1, 1),
      roughnessMap: this.woodTexture
    });

    // Main door
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.castShadow = true;
    door.position.y = doorHeight / 2;

    // Add panels
    this.createPanels(door, doorMaterial, doorDepth);

    // Add hinges
    this.createHinges(doorWidth);

    // Position knob
    this.knobGroup.position.set(doorWidth / 2 - 0.1, doorHeight / 2, doorDepth / 2);
    this.doorPanelGroup.add(this.knobGroup);

    // Add door to panel group
    this.doorPanelGroup.add(door);
    this.doorPanelGroup.position.x = -doorWidth / 2;
    this.doorGroup.add(this.doorPanelGroup);

    // Position door group
    this.doorGroup.position.set(3, 0, 0);
  }

  private createPanels(door: THREE.Mesh, material: THREE.Material, doorDepth: number): void {
    const panelShape = new THREE.Shape();
    panelShape.moveTo(-0.6, -0.3);
    panelShape.lineTo(0.6, -0.3);
    panelShape.lineTo(0.6, 0.3);
    panelShape.lineTo(-0.6, 0.3);
    panelShape.lineTo(-0.6, -0.3);

    const holePath = new THREE.Path();
    holePath.moveTo(-0.5, -0.2);
    holePath.lineTo(0.5, -0.2);
    holePath.lineTo(0.5, 0.2);
    holePath.lineTo(-0.5, 0.2);
    holePath.lineTo(-0.5, -0.2);
    panelShape.holes.push(holePath);

    const extrudeSettings = {
      steps: 1,
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3
    };

    const panelPositions = [
      [0, 3.0 * 0.75],  // Top
      [0, 3.0 * 0.3],   // Middle
      [0, 3.0 * -0.15]  // Bottom
    ];

    panelPositions.forEach(([x, y]) => {
      const panelGeometry = new THREE.ExtrudeGeometry(panelShape, extrudeSettings);
      const panel = new THREE.Mesh(panelGeometry, material);
      panel.position.set(x, y, doorDepth / 2);
      door.add(panel);
    });
  }

  private createHinges(doorWidth: number): void {
    const hingeMaterial = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0,
      roughness: 0.3,
      metalness: 0.8
    });

    const hingeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 8);
    const hingePositions = [0.2, 1.5, 2.8];

    hingePositions.forEach(y => {
      const hinge = new THREE.Mesh(hingeGeometry, hingeMaterial);
      hinge.rotation.z = Math.PI / 2;
      hinge.position.set(-doorWidth / 2 - 0.05, y, 0);
      this.doorPanelGroup.add(hinge);
    });
  }

  public animateDoor(elapsedTime: number): void {
    // Phase 3: Door opens (3-4s)
    if (elapsedTime >= 3 && elapsedTime < 4) {
      const doorT = (elapsedTime - 3) / 1;
      const easedDoorAngle = doorT * doorT * (3 - 2 * doorT);
      this.doorPanelGroup.rotation.y = easedDoorAngle * Math.PI / 2;
      
      // Animate doorknob
      const knobRotation = Math.sin(elapsedTime * 4) * 0.1;
      this.knobGroup.rotation.z = knobRotation;
    }
    // Phase 4: Hold position (4-5s)
    else if (elapsedTime >= 4 && elapsedTime < 5) {
      this.doorPanelGroup.rotation.y = Math.PI / 2;
    }
    // Phase 5: Return to start (5-7s)
    else if (elapsedTime >= 5) {
      const returnT = (elapsedTime - 5) / 2;
      const easeReturnT = returnT * returnT * (3 - 2 * returnT);
      this.doorPanelGroup.rotation.y = (1 - easeReturnT) * Math.PI / 2;
    }
  }

  public getDoorGroup(): THREE.Group {
    return this.doorGroup;
  }

  public getDoorPanelGroup(): THREE.Group {
    return this.doorPanelGroup;
  }
}
