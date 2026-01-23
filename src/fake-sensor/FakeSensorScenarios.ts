import axios from "axios";

type ScenarioMode = "leak" | "high-consumption";

interface ScenarioOptions {
  user_id: string;
  baseWeightKg?: number; // padrão 13
  apiUrl?: string;       // padrão localhost
}

function getApiUrl(custom?: string) {
  return custom ?? "http://localhost:3000";
}

function getSensorHeaders() {
  return {
    headers: {
      "x-sensor-key": process.env.SENSOR_API_KEY ?? "",
    },
  };
}

/**
 * Envia leituras "forçadas" para o endpoint real:
 * POST /api/consumption/sensor-readings
 *
 * Assim, todo o fluxo real é acionado:
 * ConsumptionService -> hourly/daily/event -> AlertService -> NotificationService
 */
export class FakeSensorScenarios {
  async run(mode: ScenarioMode, opts: ScenarioOptions) {
    if (mode === "leak") return this.sendLeakScenario(opts);
    return this.sendHighConsumptionScenario(opts);
  }

  /**
   * Cenário de vazamento:
   * - duas leituras com queda brusca em poucos minutos
   * - isso tende a gerar event SIGNIFICANT_DROP e disparar alerta LEAK (Feature 3)
   */
  async sendLeakScenario(opts: ScenarioOptions) {
    const apiUrl = getApiUrl(opts.apiUrl);
    const base = opts.baseWeightKg ?? 13;

    // leitura "normal"
    await axios.post(
      `${apiUrl}/api/consumption/sensor-readings`,
      {
        user_id: opts.user_id,
        weight_kg: base,
        percent: 100,
        created_at: new Date(Date.now() - 10 * 60 * 1000), // 10 min atrás
      },
      getSensorHeaders()
    );

    // leitura com queda brusca (ex.: -2.2kg)
    await axios.post(
      `${apiUrl}/api/consumption/sensor-readings`,
      {
        user_id: opts.user_id,
        weight_kg: Number((base - 2.2).toFixed(3)),
        percent: Number((((base - 2.2) / base) * 100).toFixed(2)),
        created_at: new Date(),
      },
      getSensorHeaders()
    );

    return {
      mode: "leak",
      sent: [
        { weight_kg: base, at: "now-10min" },
        { weight_kg: Number((base - 2.2).toFixed(3)), at: "now" },
      ],
    };
  }

  /**
   * Cenário de consumo alto:
   * Para gerar HIGH_CONSUMPTION (Feature 2), o ideal é já existir histórico em consumption_daily.
   *
   * Como o endpoint /sensor-readings normalmente alimenta hourly/daily por consumo,
   * a forma mais simples no MVP é mandar várias leituras "descendo" em sequência.
   *
   * Isso força used_kg e tende a aumentar o consumo do dia.
   */
  async sendHighConsumptionScenario(opts: ScenarioOptions) {
    const apiUrl = getApiUrl(opts.apiUrl);
    const base = opts.baseWeightKg ?? 13;

    // Vamos "gastar" ~2.5kg rápido em algumas leituras
    const sequence = [
      base,
      base - 0.6,
      base - 1.2,
      base - 1.8,
      base - 2.5,
    ];

    for (let i = 0; i < sequence.length; i++) {
      const w = Number(sequence[i].toFixed(3));
      const percent = Number(((w / base) * 100).toFixed(2));

      await axios.post(
        `${apiUrl}/api/consumption/sensor-readings`,
        {
          user_id: opts.user_id,
          weight_kg: w,
          percent,
          created_at: new Date(Date.now() - (sequence.length - 1 - i) * 60 * 1000),
        },
        getSensorHeaders()
      );
    }

    return {
      mode: "high-consumption",
      sent: sequence.map((w, idx) => ({
        weight_kg: Number(w.toFixed(3)),
        at: `${sequence.length - 1 - idx}min_ago`,
      })),
    };
  }
}
