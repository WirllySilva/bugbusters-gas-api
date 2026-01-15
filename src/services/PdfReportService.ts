import PDFDocument from "pdfkit";

type DailyRow = {
    day: Date | string;
    used_kg: number;
};

type MonthlyReport = {
    month: string; // "YYYY-MM"
    total_used_kg: number;
    days: DailyRow[];
};

type GenerateParams = {
    userName?: string;
    report: MonthlyReport;
};

export class PdfReportService {
    async generateMonthlyConsumptionPdf({ userName, report }: GenerateParams) {
        const doc = new PDFDocument({ size: "A4", margin: 40 });

        let pageNumber = 1;

        const chunks: Buffer[] = [];
        doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));

        const done = new Promise<Buffer>((resolve, reject) => {
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);
        });

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const left = doc.page.margins.left;
        const right = pageWidth - doc.page.margins.right;
        const top = doc.page.margins.top;
        const bottom = pageHeight - doc.page.margins.bottom;

        const formatDay = (d: Date | string) => {
            const date = typeof d === "string" ? new Date(d) : d;

            const day = String(date.getUTCDate()).padStart(2, "0");
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const year = date.getUTCFullYear();

            return `${day}/${month}/${year}`;
        };

        const formatKg = (n: number) => {
            const fixed = Number(n.toFixed(3));
            return String(fixed).replace(".", ",");
        };

        const ensureSpace = (neededHeight: number) => {
            if (doc.y + neededHeight <= bottom) return;

            drawFooter(pageNumber);
            doc.addPage();
            pageNumber++;
        };

        const drawDivider = () => {
            doc.moveTo(left, doc.y).lineTo(right, doc.y).stroke();
        };

        const formatMonthPtBr = (month: string) => {
            const [year, m] = month.split("-").map(Number);

            const monthNames = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
                "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
            ];

            return `${monthNames[m - 1]}/${year}`;
        }

        const drawHeader = () => {
            doc.fontSize(18).text("Relatório Mensal de Consumo", left, top, { align: "left" });
            doc.moveDown(0.4);
            doc.fontSize(10).text(`Usuário: ${userName ?? "N/A"}`);
            doc.text(`Mês: ${formatMonthPtBr(report.month)}`);
            doc.moveDown(0.6);

            // KPI box (total do mês)
            const boxY = doc.y;
            const boxH = 36;
            const boxW = right - left;

            // fundo (cinza claro)
            doc.save();
            doc.rect(left, boxY, boxW, boxH).fill("#F3F4F6");
            doc.restore();

            doc.fontSize(12).text("Total consumido no mês", left + 12, boxY + 10, {
                continued: true,
            });
            doc.fontSize(12).text(` ${formatKg(report.total_used_kg)} kg`, {
                align: "right",
                width: boxW - 24,
            });

            doc.y = boxY + boxH + 14;
        };

        const rowHeight = 18;

        const colDayX = left;
        const colKgX = left + 260;
        const colDayW = 240;
        const colKgW = right - colKgX;

        const drawTableHeader = () => {
            ensureSpace(40);

            doc.fontSize(12).text("Consumo por dia", left);
            doc.moveDown(0.4);

            // header background
            const y = doc.y;
            doc.save();
            doc.rect(left, y, right - left, rowHeight + 6).fill("#111827");
            doc.restore();

            doc.fillColor("#FFFFFF").fontSize(10);
            doc.text("Dia", colDayX + 8, y + 6, { width: colDayW });
            doc.text("Consumo (kg)", colKgX, y + 6, { width: colKgW, align: "right" });

            // reset color
            doc.fillColor("#000000");
            doc.y = y + rowHeight + 12;
        };

        const drawRow = (day: string, usedKg: number, isAlt: boolean) => {
            ensureSpace(rowHeight + 10);

            const y = doc.y;

            // zebra striping
            if (isAlt) {
                doc.save();
                doc.rect(left, y - 2, right - left, rowHeight + 6).fill("#F9FAFB");
                doc.restore();
            }

            doc.fontSize(10).fillColor("#111827");
            doc.text(day, colDayX + 8, y + 4, { width: colDayW });
            doc.text(formatKg(usedKg), colKgX, y + 4, { width: colKgW, align: "right" });

            doc.y = y + rowHeight;
        };

        // rodapé
        const drawFooter = (pageNumber: number) => {
            const footerY = doc.page.height - doc.page.margins.bottom + 10;

            doc.save();
            doc.fontSize(9).fillColor("#6B7280");
            doc.text(
                `Gerado em: ${new Date().toISOString().slice(0, 10)}`,
                left,
                footerY,
                { align: "left", lineBreak: false }
            );
            doc.text(
                `Página ${pageNumber}`,
                right,
                footerY,
                { align: "right", lineBreak: false }
            );
            
            doc.restore();
            doc.fillColor("#000000");
        };

        // Construir o pdf
        drawHeader();
        drawTableHeader();

        // linhas
        report.days.forEach((d, idx) => {
            drawRow(formatDay(d.day), d.used_kg, idx % 2 === 1);
        });

        // linha final
        doc.moveDown(0.6);
        drawDivider();

        // rodapé na última página
        drawFooter(pageNumber);

        doc.end();
        return done;
    }
}
