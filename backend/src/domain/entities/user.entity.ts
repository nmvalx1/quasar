export type UserPlan = 'free' | 'pro' | 'team';

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: UserPlan;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}
