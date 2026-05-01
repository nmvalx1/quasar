export const INTEGRATION_PROVIDER = {
  JIRA: 'jira',
  YOUTRACK: 'youtrack',
  LINEAR: 'linear',
  NOTION: 'notion',
  GITHUB: 'github',
  SLACK: 'slack',
  TELEGRAM: 'telegram',
} as const;

export type IntegrationProvider =
  (typeof INTEGRATION_PROVIDER)[keyof typeof INTEGRATION_PROVIDER];

export interface Integration {
  id: string;
  userId: string;
  provider: IntegrationProvider;
  label: string;
  connected: boolean;
  createdAt: string;
  updatedAt: string;
}
