import { useEffect, useState, useRef, RefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SceneState } from '../types/scene';
import { Dog } from '../objects/Dog';
import { Door } from '../objects/Door';

interface UseAnimatedSceneProps {
  containerRef: RefObject<HTMLDivElement>;
  isPlaying: boolean;
}

export default function useAnimatedScene({ containerRef, isPlaying }: UseAnimatedSceneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const dogRef = useRef<Dog | null>(null);
  const doorRef = useRef<Door | null>(null);
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

      // Enhanced Controls
      sceneState.current.controls = new OrbitControls(camera, renderer.domElement);
      const controls = sceneState.current.controls;
      
      // Control limits and settings
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 5;  // Minimum zoom distance
      controls.maxDistance = 15; // Maximum zoom distance
      controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera from going below ground
      controls.minPolarAngle = 0.1; // Prevent camera from going directly overhead
      controls.enablePan = true;  // Allow panning
      controls.panSpeed = 0.5;    // Reduce pan speed for more control
      controls.rotateSpeed = 0.7; // Adjusted rotation speed
      controls.zoomSpeed = 1.2;   // Slightly faster zoom

      // Add auto-rotation (disabled when user interacts)
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;

      // Reset camera position function
      const resetCamera = () => {
        const initPosition = new THREE.Vector3(8, 6, 8);
        const initTarget = new THREE.Vector3(0, 0, 0);
        
        // Smoothly animate to initial position
        const duration = 1000; // ms
        const start = {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        };
        
        const animate = (time: number) => {
          const t = Math.min(time / duration, 1);
          const easeT = t * (2 - t); // easeOut quad
          
          camera.position.set(
            start.x + (initPosition.x - start.x) * easeT,
            start.y + (initPosition.y - start.y) * easeT,
            start.z + (initPosition.z - start.z) * easeT
          );
          
          controls.target.lerp(initTarget, easeT);
          
          if (t < 1) requestAnimationFrame((newTime) => animate(newTime - performance.now() + time));
          controls.update();
        };
        
        animate(0);
      };

      // Add double-click handler for reset
      renderer.domElement.addEventListener('dblclick', resetCamera);

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

      // Environment
      const wallGeometry = new THREE.PlaneGeometry(20, 10);
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b7280,
        roughness: 0.9,
        metalness: 0.1
      });
      
      const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
      backWall.position.set(0, 5, -10);
      backWall.receiveShadow = true;
      scene.add(backWall);

      // Create dog and door instances only if they don't exist
      if (!dogRef.current) {
        dogRef.current = new Dog(scene);
      }
      if (!doorRef.current) {
        doorRef.current = new Door(scene);
      }

      setIsLoading(false);

      // Animation
      const animationDuration = 7;
      let startTime = Date.now() * 0.001;

      function animate() {
        requestAnimationFrame(animate);
        
        if (isPlaying) {
          const currentTime = Date.now() * 0.001;
          const elapsedTime = currentTime - startTime;
          const phase = Math.min(elapsedTime / animationDuration, 1);

          if (phase < 1) {
            // Animate dog and door with ref checks
            if (dogRef.current) {
              dogRef.current.animateWalking(currentTime, elapsedTime, phase);
            }
            if (doorRef.current) {
              doorRef.current.animateDoor(elapsedTime);
            }
          } else {
            // Reset animation
            startTime = currentTime;
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
        renderer.domElement.removeEventListener('dblclick', resetCamera);
        container.removeChild(renderer.domElement);
        
        // Remove dog and door instances
        if (dogRef.current) {
          scene.remove(dogRef.current.getDogBody());
          dogRef.current = null;
        }
        if (doorRef.current) {
          scene.remove(doorRef.current.getDoorGroup());
          doorRef.current = null;
        }
        
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
