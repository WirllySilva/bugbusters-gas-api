import { Router } from 'express'
import { AlertController } from '../modules/alerts/AlertController'

const routes = Router()
const controller = new AlertController()

routes.get('/alerts', controller.list)

export default routes
