import { FastifyInstance } from "fastify";
import userController from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";

async function userRoutes(app: FastifyInstance) {
  app.post("/", userController.create);
  app.get("/", userController.getAll);
  app.post("/login", userController.login);
  app.get("/me", { preHandler: authMiddleware }, async (req, res) => {
    return res.send({
      message: "Você está autenticado!",
      user: (req as any).user,
    });
  }); // teste de autenticação
}

export default userRoutes;
