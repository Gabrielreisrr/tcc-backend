import { FastifyReply, FastifyRequest } from "fastify";

class HomeController {
  public async index(req: FastifyRequest, res: FastifyReply): Promise<void> {
    res.status(200).send({
      tudoCerto: true,
    });
  }
}

export default new HomeController();
