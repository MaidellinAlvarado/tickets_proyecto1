import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class TicketService {

  // LÓGICA PARA CREAR UN TICKET NUEVO

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

  // LÓGICA PARA OBTENER TODOS LOS TICKETS
  async obtenerTickets() {
    const tickets = await prisma.ticket.findMany({
      orderBy: { created_at: 'desc' }, // Los más recientes primero
      include: {
        assigned_user: true, 
        product: true        
      }
    });
    return tickets;
  }
  

  // LÓGICA PARA ESCALAR TICKET 

  async escalarTicket(ticket_id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id }
    });
//validar que el ticket exista
    if (!ticket) {
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

    //  Actualizar el ticket a nivel 2 
    const ticketEscalado = await prisma.ticket.update({
      where: { ticket_id },
      data: {
        current_level: 2,
        status: ticket.status === 'open' ? 'in_progress' : ticket.status
      }
    });

    return ticketEscalado;
  }


  // LÓGICA PARA CERRAR TICKET
 
  async cerrarTicket(ticket_id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id }
    });

    if (!ticket) {
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