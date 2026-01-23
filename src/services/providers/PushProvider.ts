import { Prisma } from "@prisma/client";

export interface PushSendPayload {
  tokens: string[];
  title: string;
  body: string;
  data?: Prisma.JsonValue;
}

export interface PushProvider {
  providerName: string;

  send(payload: PushSendPayload): Promise<{
    external_id?: string | null;
  }>;
}
