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
    renderer: new THREE.WebGLRenderer({ antialias: true }),
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
      container.appendChild(renderer.domElement);

      // Camera
      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);

      // Controls
      sceneState.current.controls = new OrbitControls(camera, renderer.domElement);
      sceneState.current.controls.enableDamping = true;

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      const directional = new THREE.DirectionalLight(0xffffff, 1);
      directional.position.set(5, 5, 5);
      scene.add(ambient, directional);

      // Add placeholder objects
      // Dog placeholder (box)
      const dogGeometry = new THREE.BoxGeometry(1, 1, 2);
      const dogMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      const dog = new THREE.Mesh(dogGeometry, dogMaterial);
      dog.position.set(-2, 0.5, 0);
      scene.add(dog);

      // Door placeholder (thin box)
      const doorGeometry = new THREE.BoxGeometry(2, 3, 0.1);
      const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x4B2F1C });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(2, 1.5, 0);
      scene.add(door);

      // Ground plane
      const groundGeometry = new THREE.PlaneGeometry(10, 10);
      const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        side: THREE.DoubleSide 
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      setIsLoading(false);

      // Simple animation for testing
      function animate() {
        requestAnimationFrame(animate);
        
        if (isPlaying) {
          dog.rotation.y += 0.01;
          door.rotation.y = Math.sin(Date.now() * 0.001) * 0.5;
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
