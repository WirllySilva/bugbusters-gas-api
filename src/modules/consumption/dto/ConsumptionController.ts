import { Request, Response } from 'express'
import { AlertService } from '../../alerts/Alert.Service'

let lastReading: any = null

export class ConsumptionController {
  async read(request: Request, response: Response) {
    const current = request.body
    const alertService = new AlertService()

    if (lastReading) {
      const minutesBetween =
        (new Date(current.timestamp).getTime() -
          new Date(lastReading.timestamp).getTime()) / 60000

      await alertService.checkLeak({
        providerId: 'provider-123',
        previousPercentage: lastReading.percentageRemaining,
        currentPercentage: current.percentageRemaining,
        minutesBetween,
      })
    }

    lastReading = current

    return response.status(201).json({ ok: true })
  }
}
