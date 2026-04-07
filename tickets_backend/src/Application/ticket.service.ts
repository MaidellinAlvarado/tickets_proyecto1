import { prisma } from '../Infrastructure/prismaClient.js';

export class TicketService {

  // CREAR UN TICKET NUEVO
  async crearTicket(data: { subject: string; description?: string; assigned_user_id?: string; product_id?: string }) {
    const nuevoTicket = await prisma.ticket.create({
      data: {
        subject: data.subject,
        ...(data.description ? { description: data.description } : {}),
        ...(data.assigned_user_id ? { assigned_user_id: data.assigned_user_id } : {}),
        ...(data.product_id ? { product_id: data.product_id } : {})
      }
    });

    return nuevoTicket;
  }

  // OBTENER TODOS LOS TICKETS 
  async obtenerTickets() {
    const tickets = await prisma.ticket.findMany({
      where: { deleted_at: null }, 
      orderBy: { created_at: 'desc' }, 
      include: {
        assigned_user: true, 
        product: true        
      }
    });
    return tickets;
  }


  // OBTENER UN TICKET POR ID
  async obtenerTicketPorId(ticket_id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id },
      include: {
        assigned_user: true,
        product: true,
        comments: { include: { user: true } } 
      }
    });

    // Validamos si no existe o si ya fue borrado lógicamente
    if (!ticket || ticket.deleted_at !== null) {
      throw new Error('Ticket no encontrado');
    }

    return ticket;
  }

  // ELIMINAR TICKET 
  async eliminarTicket(ticket_id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id }
    });

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    if (ticket.deleted_at !== null) {
      throw new Error('El ticket ya fue eliminado previamente');
    }

    // Ejecutamos el Soft Delete cambiando la fecha
    await prisma.ticket.update({
      where: { ticket_id },
      data: { deleted_at: new Date() }
    });

    return true;
  }


  // ESCALAR TICKET 
  async escalarTicket(ticket_id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id }
    });
    
    // Validar que el ticket exista y NO esté borrado
    if (!ticket || ticket.deleted_at !== null) {
      throw new Error('Ticket no encontrado');
    }

    // Validar que no esté ya cerrado o resuelto
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      throw new Error('No se puede escalar un ticket que ya está cerrado o resuelto');
    }

    // Validar el nivel actual para escalar o ver la info del ticket 
    if (ticket.current_level >= 2) {
      throw new Error('El ticket ya se encuentra en L2');
    }

    // Actualizar el ticket a nivel 2 
    const ticketEscalado = await prisma.ticket.update({
      where: { ticket_id },
      data: {
        current_level: 2,
        status: ticket.status === 'open' ? 'in_progress' : ticket.status
      }
    });

    return ticketEscalado;
  }

  // CERRAR TICKET
  async cerrarTicket(ticket_id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id }
    });

    // Validar que exista y NO esté borrado
    if (!ticket || ticket.deleted_at !== null) {
      throw new Error('Ticket no encontrado');
    }

    if (ticket.status === 'closed') {
      throw new Error('El ticket ya se encuentra cerrado');
    }

    // Actualizar el estado a cerrado
    const ticketCerrado = await prisma.ticket.update({
      where: { ticket_id },
      data: {
        status: 'closed'
      }
    });

    return ticketCerrado;
  }
}