import { FastifyInstance } from "fastify";
import userController from "../controllers/UserController";

async function userRoutes(app: FastifyInstance) {
  app.post("/", userController.create);
  app.get("/", userController.getAll);
}

export default userRoutes;
