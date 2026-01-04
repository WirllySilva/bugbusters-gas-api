type ConsumptionAnalysisInput = {
  previousLevel: number
  currentLevel: number
  minutesBetween: number
}

export function analyzeConsumption({
  previousLevel,
  currentLevel,
  minutesBetween,
}: ConsumptionAnalysisInput) {

  const drop = previousLevel - currentLevel

  // consumo médio esperado (exemplo didático)
  const expectedDropPerMinute = 0.1
  const expectedDrop = expectedDropPerMinute * minutesBetween

  const isAbnormal = drop > expectedDrop * 3

  return {
    drop,
    expectedDrop,
    isAbnormal,
  }
}
