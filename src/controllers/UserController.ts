import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { User } from "../models/userModel";

const userSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

class UserController {
  public async create(req: FastifyRequest, res: FastifyReply) {
    try {
      const validationResult = userSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).send({ error: validationResult.error.errors });
      }

      const { name, email, password } = validationResult.data;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).send({ error: "E-mail já está em uso" });
      }

      const user = await User.create({ name, email, password });

      return res.status(201).send(user);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).send({ error: "Erro interno do servidor" });
    }
  }

  public async getAll(req: FastifyRequest, res: FastifyReply) {
    try {
      const users = await User.find();
      return res.status(200).send(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return res.status(500).send({ error: "Erro interno do servidor" });
    }
  }
}

export default new UserController();
