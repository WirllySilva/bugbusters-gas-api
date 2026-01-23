import { AlertType, Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";
import { AlertRepository } from "../repositories/AlertRepository";
import { NotificationService } from "./NotificationService";
import { alertThresholds } from "../config/alertThresholds";


function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function subDays(date: Date, days: number) {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

function hourBucketUTC(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      0,
      0,
      0
    )
  );
}

type Rule1Meta = Prisma.JsonObject | null;

export class AlertService {
  private readonly alertRepo = new AlertRepository();
  private readonly notificationService = new NotificationService();

  //  Excessive consumption
  async checkHighConsumption(user_id: string) {
    // não gera eventos repetidos por 6 horas, isso é só pra test mock
    const already = await this.alertRepo.hasRecentAlert(
      user_id,
      AlertType.HIGH_CONSUMPTION, alertThresholds.HIGH_CONSUMPTION_COOLDOWN_MIN
    );

    if (already) return { created: false, reason: "recent_alert_exists" };

    const since = subDays(new Date(), 7);

    const history = await prisma.consumption_daily.findMany({
      where: {
        user_id,
        day: { gte: startOfDay(since) },
      },
      orderBy: { day: "asc" },
    });


    if (history.length < 3) {
      return { created: false, reason: "insufficient_history" };
    }

    const avgDaily =
      history.reduce((sum, d) => sum + d.used_kg, 0) / history.length;

    const today = await prisma.consumption_daily.findFirst({
      where: { user_id, day: startOfDay(new Date()) },
    });

    if (!today) {
      return { created: false, reason: "no_today_consumption" };
    }

    const threshold = avgDaily * alertThresholds.HIGH_CONSUMPTION_MULTIPLIER;

    if (today.used_kg <= threshold) {
      return {
        created: false,
        reason: "within_expected_range",
        avgDaily,
        today: today.used_kg,
        threshold,
      };
    }

    const message = `Consumo de hoje (${today.used_kg.toFixed(
      2
    )}kg) está acima de 2x a média (${avgDaily.toFixed(2)}kg).`;

    const alert = await this.alertRepo.create({
      user_id,
      type: AlertType.HIGH_CONSUMPTION,
      message,
      metadata: {
        avgDaily,
        todayConsumption: today.used_kg,
        threshold,
        days: history.length,
      },
    });

    // Notificar watsapp e push
    const wa = await this.notificationService.send({
      user_id,
      channel: "WHATSAPP",
      template: "ALERT_HIGH_CONSUMPTION",
      message,
      payload: { alert_id: alert.alert_id, type: AlertType.HIGH_CONSUMPTION },
    });

    const push = await this.notificationService.send({
      user_id,
      channel: "PUSH",
      template: "ALERT_HIGH_CONSUMPTION",
      title: "Alerta de consumo",
      message,
      payload: { alert_id: alert.alert_id, type: AlertType.HIGH_CONSUMPTION },
    });

    return { created: true, alert, notifications: { whatsapp: wa, push } };
  }

   // Possible leak calibrado para leitura do fake sensor de 1 minuto por leitura
  async checkPossibleLeak(user_id: string) {
    // 2 horas pra não gerar spam, não gerar muitos  eventos.
    const already = await this.alertRepo.hasRecentAlert(
      user_id,
      AlertType.LEAK, alertThresholds.LEAK_COOLDOWN_MIN
    );
    if (already) return { created: false, reason: "recent_alert_exists" };

    // ---------- Regra 1: queda brusca trabalha junto com o fake sensor----------
    const lastTwoEvents = await prisma.consumption_event.findMany({
      where: { user_id },
      orderBy: { created_at: "desc" },
      take: 2,
    });

    let rule1Triggered = false;
    let rule1Meta: Rule1Meta = null;

    // calibrado para aparecer "algumas vezes"
    const RULE1_DROP_KG = alertThresholds.LEAK_DROP_KG;
    const RULE1_MAX_MINUTES = alertThresholds.LEAK_DROP_MAX_MINUTES;

    if (lastTwoEvents.length === 2) {
      const newest = lastTwoEvents[0];
      const previous = lastTwoEvents[1];

      const dropKg = previous.weight_kg - newest.weight_kg;
      const minutes =
        Math.abs(newest.created_at.getTime() - previous.created_at.getTime()) /
        60000;

      if (dropKg >= RULE1_DROP_KG && minutes <= RULE1_MAX_MINUTES) {
        rule1Triggered = true;
        rule1Meta = {
          basedOn: "consumption_event",
          previous: {
            weight_kg: previous.weight_kg,
            at: previous.created_at.toISOString(),
          },
          newest: {
            weight_kg: newest.weight_kg,
            at: newest.created_at.toISOString(),
          },
          dropKg,
          minutes,
          thresholdDropKg: RULE1_DROP_KG,
          thresholdMinutes: RULE1_MAX_MINUTES,
        };
      }
    }

    // ---------- Regra 2: consumo alto na hora atual ----------
    // Usei bucket UTC (mesmo padrão do ConsumptionService)
    const now = new Date();
    const hourBucket = hourBucketUTC(now);

    const hourlyRow = await prisma.consumption_hourly.findUnique({
      where: { user_id_hour: { user_id, hour: hourBucket } },
    });

    const usedThisHour = hourlyRow?.used_kg ?? 0;

    
    const RULE2_HOUR_THRESHOLD_KG = alertThresholds.LEAK_HOURLY_THRESHOLD_KG;

    const rule2Triggered = usedThisHour >= RULE2_HOUR_THRESHOLD_KG;

    if (!rule1Triggered && !rule2Triggered) {
      return {
        created: false,
        reason: "no_leak_pattern",
        usedThisHour,
        thresholds: { RULE1_DROP_KG, RULE1_MAX_MINUTES, RULE2_HOUR_THRESHOLD_KG },
      };
    }

    const message = rule1Triggered
      ? "Possível vazamento detectado: queda brusca em curto intervalo."
      : "Possível vazamento detectado: consumo anormalmente alto na hora atual.";

    const alert = await this.alertRepo.create({
      user_id,
      type: AlertType.LEAK,
      message,
      metadata: {
        rule1Triggered,
        rule1Meta,
        rule2Triggered,
        usedThisHourKg: usedThisHour,
        hourBucket: hourBucket.toISOString(),
        thresholds: {
          dropKg: RULE1_DROP_KG,
          minutes: RULE1_MAX_MINUTES,
          hourKg: RULE2_HOUR_THRESHOLD_KG,
        },
      },
    });

    const wa = await this.notificationService.send({
      user_id,
      channel: "WHATSAPP",
      template: "ALERT_POSSIBLE_LEAK",
      message,
      payload: { alert_id: alert.alert_id, type: AlertType.LEAK },
    });

    const push = await this.notificationService.send({
      user_id,
      channel: "PUSH",
      template: "ALERT_POSSIBLE_LEAK",
      title: "Alerta de vazamento",
      message,
      payload: { alert_id: alert.alert_id, type: AlertType.LEAK },
    });

    return { created: true, alert, notifications: { whatsapp: wa, push } };
  }


  // queries
  async listAlerts(user_id: string) {
    return this.alertRepo.listAllByUser(user_id);
  }

  async listConsumptionAlerts(user_id: string) {
    return this.alertRepo.listByType(user_id, AlertType.HIGH_CONSUMPTION);
  }

  async markHandled(alert_id: string, handled: boolean) {
    return this.alertRepo.markHandled(alert_id, handled);
  }
}
