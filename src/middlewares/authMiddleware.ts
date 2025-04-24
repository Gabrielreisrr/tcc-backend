import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../services/hashService";

export async function authMiddleware(req: FastifyRequest, res: FastifyReply) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ error: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    (req as any).user = decoded;
  } catch (error) {
    return res.status(401).send({ error: "Token inválido" });
  }
}
