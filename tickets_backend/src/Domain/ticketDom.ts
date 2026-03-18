export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketType = 'incident' | 'request';
export type TicketImpact = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  ticket_id: string;
  product_id?: string | null;
  assigned_user_id?: string | null;
  
  subject: string;
  description?: string | null;
  

  type: TicketType;
  impact: TicketImpact;
  status: TicketStatus;
  current_level: number;
  

  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}