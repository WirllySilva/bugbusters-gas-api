function envNumber(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export const alertThresholds = {
  // =========================
  // Anti-spam / cooldowns
  // =========================
  HIGH_CONSUMPTION_COOLDOWN_MIN: envNumber(
    "HIGH_CONSUMPTION_COOLDOWN_MIN",
    360 // 6h
  ),

  LEAK_COOLDOWN_MIN: envNumber(
    "LEAK_COOLDOWN_MIN",
    120 // 2h
  ),

  // =========================
  // High consumption
  // =========================
  HIGH_CONSUMPTION_MULTIPLIER: envNumber(
    "HIGH_CONSUMPTION_MULTIPLIER",
    2 // 2x a média
  ),

  // =========================
  // Possible leak
  // =========================

  // Regra 1 — queda brusca entre leituras
  LEAK_DROP_KG: envNumber(
    "LEAK_DROP_KG",
    0.35
  ),

  LEAK_DROP_MAX_MINUTES: envNumber(
    "LEAK_DROP_MAX_MINUTES",
    5
  ),

  // Regra 2 — consumo alto na hora
  LEAK_HOURLY_THRESHOLD_KG: envNumber(
    "LEAK_HOURLY_THRESHOLD_KG",
    3.8
  ),
};
