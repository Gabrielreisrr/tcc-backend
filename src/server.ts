import Fastify, { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";

import homeRoutes from "./routes/homeRouter";
import userRoutes from "./routes/userRouter";
import { mongoCLient } from "./config/database";
import transkriptorRoutes from "./routes/transcriptionRoutes";

class App {
  public app: FastifyInstance;

  constructor() {
    this.app = Fastify();
    this.middlewares();
    this.routes();
    this.database();
    this.serverLog();
  }

  private async serverLog(): Promise<void> {
    const port = Number(process.env.PORT) || 3000;
    try {
      await this.app.listen({ port, host: "0.0.0.0" });
      console.log(`Listening on port ${port}`);
      console.log("Server started at http://localhost:3000");
    } catch (error) {
      console.error("Error starting server:", error);
      process.exit(1);
    }
  }

  private async database(): Promise<void> {
    await mongoCLient();
  }

  private middlewares(): void {
    this.app.register(cors, {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    });

    this.app.register(multipart);

    this.app.register(fastifyStatic, {
      root: path.join(__dirname, "..", "tmp"),
      prefix: "/files/",
      decorateReply: false,
    });

    this.app.register(fastifyStatic, {
      root: path.join(__dirname, "..", "exports"),
      prefix: "/exports/",
      decorateReply: false,
    });
  }

  private routes(): void {
    this.app.register(homeRoutes, { prefix: "/" });
    this.app.register(userRoutes, { prefix: "/users" });
    this.app.register(transkriptorRoutes, { prefix: "/api" });
  }
}

export default new App().app;
