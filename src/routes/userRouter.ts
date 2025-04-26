import { FastifyInstance } from "fastify";
import userController from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";

async function userRoutes(app: FastifyInstance) {
  // Rotas públicas
  app.post("/", userController.create);
  app.get("/", userController.getAll);
  app.post("/login", userController.login);

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", authMiddleware);
    protectedRoutes.get("/me", userController.me);
    protectedRoutes.post("/history", userController.saveHistory);
    protectedRoutes.get("/history", userController.getHistory);
  });
}

export default userRoutes;
