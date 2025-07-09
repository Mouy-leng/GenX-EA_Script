import { createServer as createViteServer, type ViteDevServer } from "vite";
import { createServer, type Server } from "http";
import type { Express } from "express";

class ViteExpress {
  private viteServer?: ViteDevServer;
  private config: any = {};

  config(options: any) {
    this.config = options;
  }

  async bind(app: Express, server?: Server) {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    try {
      this.viteServer = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: server ? { server } : true,
        },
        appType: "spa",
        ...this.config.inlineViteConfig,
      });

      app.use(this.viteServer.ssrFixStacktrace);
      app.use(this.viteServer.middlewares);
    } catch (error) {
      console.error("Failed to create Vite server:", error);
    }
  }

  async close() {
    if (this.viteServer) {
      await this.viteServer.close();
    }
  }
}

export default new ViteExpress();