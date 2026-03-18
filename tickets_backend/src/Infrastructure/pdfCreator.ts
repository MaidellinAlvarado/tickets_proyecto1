import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PdfCreator {
  
  async generarReporteTickets(): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        //  Obtener los datos de la base de datos
        const tickets = await prisma.ticket.findMany({
          orderBy: { created_at: 'desc' }
        });

        //  Inicializar el documento PDF
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        // Capturar los datos generados
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        //  Dibujar en el PDF 
        doc.fontSize(20).text('Reporte General de Tickets', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown(2);

        // Iterar sobre los tickets y escribirlos
        tickets.forEach((ticket, index) => {
          doc.fontSize(14).text(`${index + 1}. Asunto: ${ticket.subject}`, { underline: true });
          doc.fontSize(10).text(`ID: ${ticket.ticket_id}`);
          doc.text(`Estado: ${ticket.status} | Nivel Actual: L${ticket.current_level}`);
          doc.text(`Fecha de creación: ${ticket.created_at.toLocaleDateString()}`);
          doc.moveDown();
        });

        // 4. Finalizar el documento
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }
}