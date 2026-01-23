export interface WhatsAppSendPayload {
  to: string;     
  message: string; 
}

export interface WhatsAppProvider {
  providerName: string;
  send(payload: WhatsAppSendPayload): Promise<{ external_id: string }>;
}
