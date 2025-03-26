import Fastify, { FastifyInstance } from "fastify";
import homeRoutes from "./routes/homeRouter";
import userRoutes from "./routes/userRouter";
import { mongoCLient } from "./config/database";

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
      await this.app.listen({ port });
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
    // this.app.register(require("@fastify/formbody"));
    // this.app.register(require("@fastify/json-schema"));
  }

  private routes(): void {
    this.app.register(homeRoutes, { prefix: "/" });
    this.app.register(userRoutes, { prefix: "/users" });
  }
}

export default new App().app;
