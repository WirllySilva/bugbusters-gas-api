export async function sendNotification(phone: string, message: string): Promise<void> {
  console.log(`\n--- SIMULAÇÃO DE ENVIO DE CÓDIGO ---`);
  console.log(`Destinatário: ${phone}`);
  console.log(`Mensagem: ${message}`);
  console.log(`-------------------------------------\n`);

  await new Promise((resolve) => setTimeout(resolve, 50));
}
