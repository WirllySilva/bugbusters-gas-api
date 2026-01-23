import { PushProvider } from "./PushProvider";
import { Prisma } from "@prisma/client";

export class MockPushProvider implements PushProvider {
  providerName = "mock-push";

  async send(data: {
    tokens: string[];
    title: string;
    body: string;
    data?: Prisma.JsonValue;
  }) {
    // usa o input para gerar um id determinístico
    const tokenCount = data.tokens.length;
    const titleLen = data.title.length;

    return {
      external_id: `mock-push-${Date.now()}-${tokenCount}-${titleLen}`,
    };
  }
}
