export class ConsumptionAnalysisService {
  static analyze(
    previousPercentage: number,
    currentPercentage: number,
    minutesBetween: number
  ) {
    const drop = previousPercentage - currentPercentage;

    const expectedDropPerMinute = 0.05; // regra MVP
    const expectedDrop = expectedDropPerMinute * minutesBetween;

    const isAbnormal = drop > expectedDrop * 3;

    return {
      drop,
      expectedDrop,
      isAbnormal,
    };
  }
}
