import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class controllerComments {
  //  Método para Guardar 
  async crear(req: Request, res: Response) {
    try {
      const { ticket_id, user_id, content } = req.body;

      // Validación de datos obligatorios
      if (!ticket_id || !user_id || !content) {
        return res.status(400).json({ 
          success: false, 
          message: "Faltan campos obligatorios: ticket_id, user_id o content" 
        });
      }

      const nuevoComentario = await prisma.comment.create({
        data: { 
          ticket_id, 
          user_id, 
          content 
        }
      });

      return res.status(201).json({ 
        success: true, 
        message: "Comentario creado con éxito",
        data: nuevoComentario 
      });

    } catch (error: any) {
      console.error("ERROR EN PRISMA:", error.message);
      return res.status(500).json({ 
        success: false, 
        message: "Error de base de datos. Verifica IDs.",
        error: error.message 
      });
    }
  }

  // Método para Listar 
  async listarPorTicket(req: Request, res: Response) {
  try {
    //Extraemos el ID y aseguramos que sea un string simple 
    const ticketId = req.params.id as string; 

    // Validación de seguridad 
    if (!ticketId) {
      return res.status(400).json({ success: false, message: "ID de ticket no proporcionado" });
    }

    // Consulta a Prisma con el tipo de dato correcto
    const comentarios = await prisma.comment.findMany({
      where: { 
        ticket_id: ticketId
      },
      orderBy: { created_at: 'asc' } 
    });

    return res.status(200).json({ success: true, data: comentarios });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: "Error al obtener comentarios",
      error: error.message 
    });
  }
}
}