export interface User {
  id: string;
  email: string;
  phone_number?: string;
  name?: string;
  dob?: string;
  dp_url?: string;
  is_online: boolean;
  last_login?: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_id?: string;
  created_at: string;
  // Joined fields
  other_user?: User;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'emoji';
  status: 'sent' | 'seen';
  deleted_at?: string;
  created_at: string;
}

export interface Status {
  id: string;
  user_id: string;
  content: string;
  background_color: string;
  created_at: string;
  expires_at: string;
  // Joined
  user?: User;
}

export type AuthProvider = 'email' | 'google';
export type Theme = 'light' | 'dark';
