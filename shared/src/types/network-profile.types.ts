/**
 * Правила фильтрации сети уточнятся в фиче Network Profiles;
 * пока — без жёсткой схемы, но не `any`.
 */
export type NetworkProfileFilterConfig = Readonly<Record<string, unknown>>;

export interface NetworkProfile {
  id: string;
  userId: string;
  name: string;
  filterConfig: NetworkProfileFilterConfig;
  createdAt: string;
  updatedAt: string;
}
