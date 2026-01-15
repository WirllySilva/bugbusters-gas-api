import { PdfReportService } from "../src/services/PdfReportService";
import fs from "node:fs";

async function main() {
  const pdf = new PdfReportService();

  const buffer = await pdf.generateMonthlyConsumptionPdf({
    userName: "Wirlly",
    report: {
      month: "2025-05",
      total_used_kg: 12.8,
      days: [
        { day: new Date("2025-05-01T00:00:00.000Z"), used_kg: 1.0 },
        { day: new Date("2025-05-02T00:00:00.000Z"), used_kg: 0.5 },
        { day: new Date("2025-05-03T00:00:00.000Z"), used_kg: 0.75 },
      ],
    },
  });

  fs.mkdirSync("tmp", { recursive: true });
  fs.writeFileSync("tmp/consumption-2025-05.pdf", buffer);

  console.log("PDF gerado em: tmp/consumption-2025-05.pdf");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
