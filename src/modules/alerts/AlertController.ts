import { Request, Response } from 'express'
import { AlertRepository } from './AlertRepository'

export class AlertController {
  async list(request: Request, response: Response) {
    const alerts = await AlertRepository.findAll()
    return response.json(alerts)
  }
}
