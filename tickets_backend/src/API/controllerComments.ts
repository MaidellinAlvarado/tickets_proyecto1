import type { Request, Response } from 'express';
import { CommentService } from '../Application/commentService.js';

// Instanciamos el servicio 
const commentService = new CommentService();
export class controllerComments {
  // Método para Guardar 
  async crear(req: Request, res: Response) {
    try {
      const { ticket_id, user_id, content } = req.body;

      // Validación de datos obligatorios
      if (!ticket_id || !user_id || !content) {
        return res.status(400).json({ 
          success: false, 
          message: "Faltan campos" 
        });
      }

      // Delegamos la inserción a la capa de Application
      const nuevoComentario = await commentService.crearComentario(ticket_id, user_id, content);

      return res.status(201).json({ 
        success: true, 
        message: "Comentario creado con éxito",
        data: nuevoComentario 
      });

    } catch (error: any) {
      console.error("ERROR :", error.message);
      return res.status(500).json({ 
        success: false, 
        message: "Error en el sistema.",
        error: error.message 
      });
    }
  }

  // Método para Listar 
  async listarPorTicket(req: Request, res: Response) {
    try {
      // Extraemos el ID y aseguramos que sea un string simple 
      const ticketId = req.params.id as string; 

      // Validación de seguridad de la API
      if (!ticketId) {
        return res.status(400).json({ success: false, message: "ID de ticket no proporcionado" });
      }

      // Delegamos la consulta a la capa de Application
      const comentarios = await commentService.obtenerComentarios(ticketId);

      return res.status(200).json({ success: true, data: comentarios });
    } catch (error: any) {
      return res.status(500).json({ 
        success: false, 
        message: "Error al obtener comentarios",
        error: error.message 
      });
    }
  }

  // Método para Obtener por ID
  async obtenerPorId(req: Request, res: Response) {
    try {
      const commentId = req.params.id as string;

      if (!commentId) {
        return res.status(400).json({ success: false, message: "ID no proporcionado" });
      }

      const comentario = await commentService.obtenerComentarioPorId(commentId);

      return res.status(200).json({ success: true, data: comentario });
    } catch (error: any) {
      if (error.message === 'Comentario no encontrado') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor",
        error: error.message 
      });
    }
  }

  // Método para Eliminar (Soft Delete)
  async eliminar(req: Request, res: Response) {
    try {
      const commentId = req.params.id as string;

      if (!commentId) {
        return res.status(400).json({ success: false, message: "ID no proporcionado" });
      }

      await commentService.eliminarComentario(commentId);

      return res.status(200).json({ success: true, message: "Comentario eliminado lógicamente" });
    } catch (error: any) {
      if (error.message === 'Comentario no encontrado' || error.message === 'El comentario ya fue eliminado previamente') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ 
        success: false, 
        message: "Error al intentar eliminar el comentario",
        error: error.message 
      });
    }
  }
}