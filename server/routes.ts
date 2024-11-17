import type { Express } from "express";
import express from "express";
import path from "path";

export function registerRoutes(app: Express) {
  // Serve 3D models from public directory
  app.use('/models', express.static(path.join(process.cwd(), 'public/models')));
}
