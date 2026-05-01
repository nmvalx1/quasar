import type { UserPlan } from './user-plan.types';

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
}
