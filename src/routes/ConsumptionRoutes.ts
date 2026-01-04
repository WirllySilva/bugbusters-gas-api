import { Router } from 'express'
import { ConsumptionController } from '../modules/consumption/dto/ConsumptionController'

const routes = Router()
const controller = new ConsumptionController()

routes.post('/consumption/read', controller.read)

export default routes
