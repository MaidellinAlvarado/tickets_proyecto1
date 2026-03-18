// Definimos los roles tal 
export type UserRole = 'l1_agent' | 'l2_agent';

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  
  // Auditoría
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}