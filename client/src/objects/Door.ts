import * as THREE from 'three';

export class Door {
  private doorGroup: THREE.Group;
  private door: THREE.Mesh;
  private scene: THREE.Scene;
  private initialState: {
    rotation: THREE.Vector3;
    position: THREE.Vector3;
  };

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.doorGroup = new THREE.Group();
    this.door = this.createDoor();
    
    // Initialize state tracking
    this.initialState = {
      rotation: new THREE.Vector3(0, 0, 0),
      position: new THREE.Vector3(3, 0, 0)
    };
    
    // Set initial position through the group
    this.doorGroup.position.copy(this.initialState.position);
    this.scene.add(this.doorGroup);
  }

  private createDoor(): THREE.Mesh {
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

    // Create door mesh at origin
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.castShadow = true;
    door.position.y = doorHeight / 2;
    door.position.x = -doorWidth / 2;

    // Add door to group
    this.doorGroup.add(door);
    return door;
  }

  public reset(): void {
    // Reset group position and rotation
    this.doorGroup.position.copy(this.initialState.position);
    this.doorGroup.rotation.set(
      this.initialState.rotation.x,
      this.initialState.rotation.y,
      this.initialState.rotation.z
    );
  }

  public animateDoor(elapsedTime: number): void {
    // Phase 3: Door opens (3-4s)
    if (elapsedTime >= 3 && elapsedTime < 4) {
      const doorT = (elapsedTime - 3) / 1;
      const easedDoorAngle = doorT * doorT * (3 - 2 * doorT);
      this.doorGroup.rotation.y = easedDoorAngle * Math.PI / 2;
    }
    // Phase 4: Hold position (4-5s)
    else if (elapsedTime >= 4 && elapsedTime < 5) {
      this.doorGroup.rotation.y = Math.PI / 2;
    }
    // Phase 5: Return to start (5-7s)
    else if (elapsedTime >= 5) {
      const returnT = (elapsedTime - 5) / 2;
      const easeReturnT = returnT * returnT * (3 - 2 * returnT);
      this.doorGroup.rotation.y = (1 - easeReturnT) * Math.PI / 2;
    }
  }

  public getDoorGroup(): THREE.Group {
    return this.doorGroup;
  }
}
