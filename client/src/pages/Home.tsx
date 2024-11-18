import { Card } from "@/components/ui/card";
import Scene from "../components/Scene";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-4">
      <main className="container mx-auto">
        <Card className="overflow-hidden bg-black/50 backdrop-blur-sm">
          <div className="aspect-video w-full relative">
            <Scene isPlaying={isPlaying} />
            <div className="absolute top-4 left-4 text-white/70 text-sm bg-black/30 p-3 rounded-lg backdrop-blur-sm">
              <p>Camera Controls:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Left Click + Drag to rotate</li>
                <li>Right Click + Drag to pan</li>
                <li>Scroll to zoom</li>
                <li>Double Click to reset view</li>
              </ul>
            </div>
          </div>
          <div className="p-4 flex justify-center">
            <Button 
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-primary/80 hover:bg-primary"
            >
              {isPlaying ? "Reset Animation" : "Start Animation"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
