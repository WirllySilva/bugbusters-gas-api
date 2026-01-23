import { WhatsAppProvider, WhatsAppSendPayload } from "./WhatsAppProvider";

export class MockWhatsAppProvider implements WhatsAppProvider {
  providerName = "mock-whatsapp";

  async send(payload: WhatsAppSendPayload): Promise<{ external_id: string }> {
    // Simula chamada externa
    console.log("[MOCK WHATSAPP] Sending:", payload);

    return { external_id: `mock-wa-${Date.now()}` };
  }
}
