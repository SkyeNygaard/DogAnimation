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
