import { useEffect, useState, useRef, RefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SceneState } from '../types/scene';

interface UseAnimatedSceneProps {
  containerRef: RefObject<HTMLDivElement>;
  isPlaying: boolean;
}

export default function useAnimatedScene({ containerRef, isPlaying }: UseAnimatedSceneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const sceneState = useRef<SceneState>({
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
    renderer: new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    }),
    controls: null,
    mixer: null,
    clock: new THREE.Clock(),
  });

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const { current: container } = containerRef;
      const { scene, camera, renderer } = sceneState.current;
      const textureLoader = new THREE.TextureLoader();

      // Setup
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Camera
      camera.position.set(8, 6, 8);
      camera.lookAt(0, 0, 0);

      // Controls
      sceneState.current.controls = new OrbitControls(camera, renderer.domElement);
      sceneState.current.controls.enableDamping = true;
      sceneState.current.controls.dampingFactor = 0.05;

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
      mainLight.position.set(5, 8, 5);
      mainLight.castShadow = true;
      mainLight.shadow.camera.near = 0.1;
      mainLight.shadow.camera.far = 30;
      mainLight.shadow.camera.left = -10;
      mainLight.shadow.camera.right = 10;
      mainLight.shadow.camera.top = 10;
      mainLight.shadow.camera.bottom = -10;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0x9ca3af, 0.4);
      fillLight.position.set(-5, 3, -5);
      scene.add(fillLight);

      // Ground
      const groundGeometry = new THREE.PlaneGeometry(20, 20);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3f3f3f,
        roughness: 0.8,
        metalness: 0.2
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Add environment elements
      const wallGeometry = new THREE.PlaneGeometry(20, 10);
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b7280,
        roughness: 0.9,
        metalness: 0.1
      });
      
      // Back wall
      const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
      backWall.position.set(0, 5, -10);
      backWall.receiveShadow = true;
      scene.add(backWall);

      // Dog placeholder (improved)
      const dogHeight = 1.2;
      const dogBody = new THREE.Group();
      
      // Body
      const bodyGeometry = new THREE.BoxGeometry(0.8, 0.6, 1.2);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.7,
        metalness: 0.2
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = dogHeight / 2;
      body.castShadow = true;
      dogBody.add(body);

      // Head
      const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
      const head = new THREE.Mesh(headGeometry, bodyMaterial);
      head.position.set(0, dogHeight / 2 + 0.3, 0.6);
      head.castShadow = true;
      dogBody.add(head);

      // Legs
      const legGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
      const legPositions = [
        [-0.3, -0.2, 0.4], // Front Left
        [0.3, -0.2, 0.4],  // Front Right
        [-0.3, -0.2, -0.4], // Back Left
        [0.3, -0.2, -0.4]  // Back Right
      ];

      legPositions.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeometry, bodyMaterial);
        leg.position.set(x, dogHeight / 2 + y, z);
        leg.castShadow = true;
        dogBody.add(leg);
      });

      dogBody.position.set(-3, 0, 0);
      scene.add(dogBody);

      // Door with frame and details
      const doorGroup = new THREE.Group();
      
      // Frame
      const frameDepth = 0.2;
      const frameWidth = 2.2;
      const frameHeight = 3.2;
      
      // Create procedural wood grain texture
      const woodTexture = new THREE.DataTexture(
        (() => {
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
          return data;
        })(),
        256,
        256,
        THREE.RGBAFormat
      );
      woodTexture.needsUpdate = true;

      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x5D4037,
        roughness: 0.7,
        metalness: 0.1,
        map: woodTexture,
        normalMap: woodTexture,
        normalScale: new THREE.Vector2(0.5, 0.5),
        roughnessMap: woodTexture
      });

      // Main frame
      const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.y = frameHeight / 2;
      frame.castShadow = true;
      frame.receiveShadow = true;
      doorGroup.add(frame);

      // Create door with embossed panels
      const doorWidth = 1.8;
      const doorHeight = 3.0;
      const doorDepth = 0.1;

      // Create panel shapes for extrusion
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

      // Create door material with wood texture
      const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.1,
        map: woodTexture,
        normalMap: woodTexture,
        normalScale: new THREE.Vector2(1, 1),
        roughnessMap: woodTexture
      });

      // Create main door geometry
      const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.castShadow = true;
      door.position.y = doorHeight / 2;

      // Add embossed panels
      const panelPositions = [
        [0, doorHeight * 0.75],  // Top panel
        [0, doorHeight * 0.3],   // Middle panel
        [0, doorHeight * -0.15]  // Bottom panel
      ];

      panelPositions.forEach(([x, y]) => {
        const panelGeometry = new THREE.ExtrudeGeometry(panelShape, extrudeSettings);
        const panel = new THREE.Mesh(panelGeometry, doorMaterial);
        panel.position.set(x, y, doorDepth / 2);
        door.add(panel);
      });

      // Create door panel group for cohesive movement
      const doorPanelGroup = new THREE.Group();
      doorPanelGroup.add(door);

      // Hinges
      const hingeMaterial = new THREE.MeshStandardMaterial({
        color: 0xC0C0C0,
        roughness: 0.3,
        metalness: 0.8
      });

      const hingeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 8);
      const hingePositions = [0.2, 1.5, 2.8]; // Bottom, middle, top

      hingePositions.forEach(y => {
        const hinge = new THREE.Mesh(hingeGeometry, hingeMaterial);
        hinge.rotation.z = Math.PI / 2;
        hinge.position.set(-doorWidth / 2 - 0.05, y, 0);
        doorPanelGroup.add(hinge);
      });

      // Doorknob
      const knobGroup = new THREE.Group();
      
      // Knob base
      const knobBaseMaterial = hingeMaterial;
      const knobBaseGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16);
      const knobBase = new THREE.Mesh(knobBaseGeometry, knobBaseMaterial);
      knobBase.rotation.z = Math.PI / 2;
      knobGroup.add(knobBase);

      // Knob handle
      const knobHandleGeometry = new THREE.SphereGeometry(0.06, 16, 16);
      const knobHandle = new THREE.Mesh(knobHandleGeometry, knobBaseMaterial);
      knobHandle.position.x = 0.1;
      knobGroup.add(knobHandle);

      // Position knob group on door
      knobGroup.position.set(doorWidth / 2 - 0.1, doorHeight / 2, doorDepth / 2);
      doorPanelGroup.add(knobGroup);

      // Position door panel group at hinge point
      doorPanelGroup.position.x = -doorWidth / 2;
      doorGroup.add(doorPanelGroup);

      // Position entire door group in scene
      doorGroup.position.set(3, 0, 0);
      scene.add(doorGroup);

      setIsLoading(false);

      // Animation
      function animate() {
        requestAnimationFrame(animate);
        
        if (isPlaying) {
          const time = Date.now() * 0.001;
          
          // Dog walking animation
          const walkSpeed = 2;
          const legAnimationHeight = 0.1;
          
          legPositions.forEach((_, index) => {
            const leg = dogBody.children[index + 2]; // +2 to skip body and head
            const phase = (time * walkSpeed + (index * Math.PI / 2)) % (Math.PI * 2);
            leg.position.y = dogHeight / 2 - 0.2 + Math.sin(phase) * legAnimationHeight;
          });
          
          // Smooth door animation with easing
          const doorOpenAngle = Math.sin(time * 0.3) * 0.5 + 0.5; // Slower, smoother movement
          const easedAngle = doorOpenAngle * doorOpenAngle * (3 - 2 * doorOpenAngle); // Smooth easing
          doorPanelGroup.rotation.y = easedAngle * Math.PI / 2;

          // Subtle doorknob animation
          if (knobGroup) {
            const knobRotation = Math.sin(time * 2) * 0.05;
            knobGroup.rotation.z = knobRotation;
          }
        }
        
        if (sceneState.current.controls) {
          sceneState.current.controls.update();
        }
        
        renderer.render(scene, camera);
      }
      animate();

      // Handle window resize
      function handleResize() {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(newWidth, newHeight);
      }
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        container.removeChild(renderer.domElement);
        if (sceneState.current.controls) {
          sceneState.current.controls.dispose();
        }
      };
    } catch (err) {
      console.error('Scene initialization error:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize 3D scene'));
      setIsLoading(false);
    }
  }, [containerRef, isPlaying]);

  return { isLoading, error };
}
