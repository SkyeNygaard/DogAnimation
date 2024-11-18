import * as THREE from 'three';

export class Door {
  private doorGroup: THREE.Group;
  private door: THREE.Mesh;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.doorGroup = new THREE.Group();
    this.createDoor();
    this.scene.add(this.doorGroup);
  }

  private createDoor(): void {
    // Door dimensions
    const doorWidth = 1.8;
    const doorHeight = 3.0;
    const doorDepth = 0.1;

    // Create simple door geometry and material
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.1
    });

    // Create door mesh
    this.door = new THREE.Mesh(doorGeometry, doorMaterial);
    this.door.castShadow = true;
    this.door.position.y = doorHeight / 2;
    this.door.position.x = -doorWidth / 2;

    // Add door to group and position in scene
    this.doorGroup.add(this.door);
    this.doorGroup.position.set(3, 0, 0);
  }

  public animateDoor(elapsedTime: number): void {
    // Phase 3: Door opens (3-4s)
    if (elapsedTime >= 3 && elapsedTime < 4) {
      const doorT = (elapsedTime - 3) / 1;
      const easedDoorAngle = doorT * doorT * (3 - 2 * doorT);
      this.door.rotation.y = easedDoorAngle * Math.PI / 2;
    }
    // Phase 4: Hold position (4-5s)
    else if (elapsedTime >= 4 && elapsedTime < 5) {
      this.door.rotation.y = Math.PI / 2;
    }
    // Phase 5: Return to start (5-7s)
    else if (elapsedTime >= 5) {
      const returnT = (elapsedTime - 5) / 2;
      const easeReturnT = returnT * returnT * (3 - 2 * returnT);
      this.door.rotation.y = (1 - easeReturnT) * Math.PI / 2;
    }
  }

  public getDoorGroup(): THREE.Group {
    return this.doorGroup;
  }
}