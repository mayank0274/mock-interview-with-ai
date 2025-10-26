export interface IUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  subscription_tier: 'Free' | 'Premium';
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}
