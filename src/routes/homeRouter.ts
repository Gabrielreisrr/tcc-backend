import { FastifyInstance } from 'fastify';
import homeController from '../controllers/HomeController';

async function homeRoutes(app: FastifyInstance) {
    app.get('/', homeController.index);
}

export default homeRoutes;