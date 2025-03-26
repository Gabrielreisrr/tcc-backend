import { FastifyInstance } from "fastify";
import userController from "../controllers/UserController";

async function userRoutes(app: FastifyInstance) {
  app.post("/users", userController.create);
  app.get("/users", userController.getAll);
}

export default userRoutes;
