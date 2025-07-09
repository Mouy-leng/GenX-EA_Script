import express from "express";
import { registerRoutes } from "./routes.js";
import ViteExpress from "./vite.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const server = await registerRoutes(app);

// Development mode setup with Vite
if (process.env.NODE_ENV === "development") {
  ViteExpress.config({
    inlineViteConfig: {
      server: {
        middlewareMode: true,
        hmr: { server }
      }
    }
  });
  ViteExpress.bind(app, server);
}

// Start server
server.listen(port, "0.0.0.0", () => {
  console.log(`GenZ Trading Bot Pro server listening on port ${port}`);
});