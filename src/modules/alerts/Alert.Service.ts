import { AlertRepository } from './AlertRepository'
import { ConsumptionAnalysisService } from './ConsumptionAnalysisService'

export class AlertService {
  async checkLeak(data: {
    providerId: string
    previousPercentage: number
    currentPercentage: number
    minutesBetween: number
  }) {
    const analysis = ConsumptionAnalysisService.analyze(
      data.previousPercentage,
      data.currentPercentage,
      data.minutesBetween
    )

    if (!analysis.isAbnormal) return null

    const severity =
      analysis.drop > analysis.expectedDrop * 6 ? 'high' : 'medium'

    return AlertRepository.create({
      providerId: data.providerId,
      type: 'gas_leak',
      severity,
      message: `Queda anormal detectada: ${analysis.drop.toFixed(2)}%`,
    })
  }
}
