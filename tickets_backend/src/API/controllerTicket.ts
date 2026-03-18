import type { Request, Response } from 'express';
import { TicketService } from '../Application/ticket.service.js';
const ticketService = new TicketService();

import { PdfCreator } from '../Infrastructure/pdfCreator.js';
const pdfCreator = new PdfCreator();



export class TicketController {



  // Tomar la petición para Crear
  async crear(req: Request, res: Response) {
    try {
      const { subject, description, assigned_user_id, product_id } = req.body;

      // Validación básica
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'El asunto (subject) del ticket es obligatorio.'
        });
      }

      const nuevoTicket = await ticketService.crearTicket({ subject, description, assigned_user_id, product_id });

      res.status(201).json({
        success: true,
        message: 'Ticket creado exitosamente',
        data: nuevoTicket
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el ticket: ' + error.message
      });
    }
  }

  // Tomar la petición para Listar
  async listar(req: Request, res: Response) {
    try {
      const tickets = await ticketService.obtenerTickets();
      res.status(200).json({
        success: true,
        data: tickets
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los tickets: ' + error.message
      });
    }
  }
  
  // Tomar la petición para Escalar
  async escalar(req: Request, res: Response) {
    try {
      const ticketId = req.params.id; 

      if (typeof ticketId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El ID del ticket es inválido.'
        });
      }

      const ticketEscalado = await ticketService.escalarTicket(ticketId);
      
      res.status(200).json({
        success: true,
        message: 'Ticket escalado a L2',
        data: ticketEscalado
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Tomar la petición para Cerrar
  async cerrar(req: Request, res: Response) {
    try {
      const ticketId = req.params.id;
      
      if (typeof ticketId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El ID del ticket es inválido .'
        });
      }

      const ticketCerrado = await ticketService.cerrarTicket(ticketId);

      res.status(200).json({
        success: true,
        message: 'Ticket cerrado',
        data: ticketCerrado
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }


  // Tomar la petición para Descargar Reporte PDF
  async descargarReporte(req: Request, res: Response) {
    try {
      
      const pdfBuffer = await pdfCreator.generarReporteTickets();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-tickets.pdf');
      
      // Enviamos el archivo
      res.send(pdfBuffer);

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al generar el reporte PDF: ' + error.message
      });
    }
  }


} 