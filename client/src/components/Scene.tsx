import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import useAnimatedScene from '../hooks/useAnimatedScene';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from "@/hooks/use-toast";

interface SceneProps {
  isPlaying: boolean;
}

export default function Scene({ isPlaying }: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLoading, error } = useAnimatedScene({ containerRef, isPlaying });
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load 3D scene",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
