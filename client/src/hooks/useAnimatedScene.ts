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

      // Add fill light
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

      // Door with frame
      const doorGroup = new THREE.Group();
      
      // Frame
      const frameGeometry = new THREE.BoxGeometry(2.2, 3.2, 0.2);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x4B2F1C,
        roughness: 0.9,
        metalness: 0.1
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.y = 1.6;
      frame.castShadow = true;
      frame.receiveShadow = true;
      doorGroup.add(frame);

      // Door
      const doorGeometry = new THREE.BoxGeometry(1.8, 3, 0.1);
      const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.7,
        metalness: 0.2
      });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(-0.9, 1.5, 0); // Positioned at hinge point
      door.castShadow = true;
      doorGroup.add(door);

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
          
          // Door animation
          const doorOpenAngle = (Math.sin(time * 0.5) + 1) * 0.5 * Math.PI / 2;
          door.rotation.y = doorOpenAngle;
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
