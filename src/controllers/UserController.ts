import { FastifyRequest, FastifyReply } from "fastify";
import User from "../models/userModel";

class UserController {
  public async create(
    req: FastifyRequest<{
      Body: { name: string; email: string; password: string };
    }>,
    res: FastifyReply
  ) {
    try {
      const { name, email, password } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).send({ error: "Email already in use" });
      }

      const user = await User.create({ name, email, password });

      return res.status(201).send(user);
    } catch (error) {
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  public async getAll(req: FastifyRequest, res: FastifyReply) {
    try {
      const users = await User.find();
      return res.status(200).send(users);
    } catch (error) {
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
}

export default new UserController();
