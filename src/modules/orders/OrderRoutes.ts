import { Router } from 'express';
import { OrderController } from './OrderController';
import { authMiddleware } from '../../config/authMiddleware';

const routes = Router();
const controller = new OrderController();

routes.post('/orders', authMiddleware, controller.create);

export default routes;
