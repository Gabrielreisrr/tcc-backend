import Fastify, { FastifyInstance } from "fastify";
import homeRoutes from "./routes/homeRouter";

class App {
  public app: FastifyInstance;

  constructor() {
    this.app = Fastify();
    this.middlewares();
    this.routes();
    this.serverLog()
  }

  private serverLog(): void {
    this.app.listen({ port: 300 }, () => {
      console.log("Listening port at 300");
    });
  }

  private middlewares(): void {
    // this.app.register(require("@fastify/formbody"));
    // this.app.register(require("@fastify/json-schema"));
  }

  private routes(): void {
    this.app.register(homeRoutes, { prefix: "/" });
  }
}

export default new App().app;
