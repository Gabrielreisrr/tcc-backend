import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { User } from "../models/userModel";
import bcrypt from "bcrypt";
import { generateToken } from "../services/hashService";
import History from "../models/History";

const userSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const segmentSchema = z.object({
  time: z.string(),
  text: z.string(),
});

const historySchema = z.object({
  title: z.string(),
  url: z.string(),
  type: z.string(),
  segments: z.array(segmentSchema),
});

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
    };
  }
}

const segmentsSchema = z.array(segmentSchema);

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

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

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

  public async login(req: FastifyRequest, res: FastifyReply) {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).send({ error: validation.error.errors });
      }

      const { email, password } = validation.data;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send({ error: "Usuário não encontrado" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).send({ error: "Senha incorreta" });
      }

      const token = generateToken({
        id: user._id,
      });

      return res.send({ token, user: { name: user.name, email: user.email } });
    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).send({ error: "Erro interno" });
    }
  }

  public async saveHistory(
    req: FastifyRequest<{ Body: z.infer<typeof historySchema> }>,
    res: FastifyReply
  ) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).send({ error: "Não autorizado" });
      }

      const validation = historySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).send({ error: validation.error.errors });
      }

      const userId = req.user.id;
      const { title, url, type, segments } = req.body;

      await History.create({ userId, title, url, type, segments });
      res.send({ ok: true });
    } catch (error) {
      console.error("Erro ao salvar histórico:", error);
      res.status(500).send({ error: "Erro ao salvar histórico" });
    }
  }

  public async getHistory(req: FastifyRequest, res: FastifyReply) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).send({ error: "Não autorizado" });
      }

      const userId = req.user.id;
      const recent = await History.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);

      res.send(recent);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      res.status(500).send({ error: "Erro ao buscar histórico" });
    }
  }

  public async me(req: FastifyRequest, res: FastifyReply) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).send({ error: "Não autorizado" });
      }

      const user = await User.findById(req.user.id).select("name email");
      if (!user) {
        return res.status(404).send({ error: "Usuário não encontrado" });
      }

      return res.send({ user });
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
      return res.status(500).send({ error: "Erro interno do servidor" });
    }
  }
}

export default new UserController();
