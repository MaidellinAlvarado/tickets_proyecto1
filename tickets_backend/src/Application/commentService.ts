// Importamos la conexión centralizada desde Infrastructure
import { prisma } from '../Infrastructure/prismaClient.js';

export class CommentService {
  
  // Lógica para crear el comentario en la base de datos
  async crearComentario(ticket_id: string, user_id: string, content: string) {
    const nuevoComentario = await prisma.comment.create({
      data: { 
        ticket_id, 
        user_id, 
        content 
      }
    });
    
    return nuevoComentario;
  }

  // Lógica para listar los comentarios ordenados (Aplicando Soft Delete)
  async obtenerComentarios(ticketId: string) {
    const comentarios = await prisma.comment.findMany({
      where: { 
        ticket_id: ticketId,
        deleted_at: null 
      },
      orderBy: { created_at: 'asc' } 
    });

    return comentarios;
  }



  // Lógica para obtener un solo comentario por su ID
  async obtenerComentarioPorId(comment_id: string) {
    const comentario = await prisma.comment.findUnique({
      where: { comment_id },
      include: {
        user: true // Traemos al usuario para saber quién comentó
      }
    });

    if (!comentario || comentario.deleted_at !== null) {
      throw new Error('Comentario no encontrado');
    }

    return comentario;
  }

  // Lógica para eliminar un comentario (Soft Delete)
  async eliminarComentario(comment_id: string) {
    const comentario = await prisma.comment.findUnique({
      where: { comment_id }
    });

    if (!comentario) {
      throw new Error('Comentario no encontrado');
    }

    if (comentario.deleted_at !== null) {
      throw new Error('El comentario ya fue eliminado previamente');
    }

    // El Update mágico para el Soft Delete
    await prisma.comment.update({
      where: { comment_id },
      data: { deleted_at: new Date() }
    });

    return true;
  }
}