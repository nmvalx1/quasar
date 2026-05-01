export const USER_PLAN = {
  FREE: 'free',
  PRO: 'pro',
  TEAM: 'team',
} as const;

export type UserPlan = (typeof USER_PLAN)[keyof typeof USER_PLAN];

/** Лимиты тарифа (числа — «сколько можно», Infinity — без лимита). */
export interface PlanLimits {
  bugReportsPerDay: number;
  bugReportStorageDays: number;
  networkProfiles: number;
  sessionsPerDay: number;
  customSnippets: number;
  readonly integrations: readonly string[];
  teamMembers?: number;
}

export const FREE_LIMITS = {
  bugReportsPerDay: 5,
  bugReportStorageDays: 7,
  networkProfiles: 3,
  sessionsPerDay: 3,
  customSnippets: 5,
  integrations: [] as readonly string[],
} satisfies PlanLimits;

export const PRO_LIMITS = {
  bugReportsPerDay: Number.POSITIVE_INFINITY,
  bugReportStorageDays: 90,
  networkProfiles: Number.POSITIVE_INFINITY,
  sessionsPerDay: Number.POSITIVE_INFINITY,
  customSnippets: Number.POSITIVE_INFINITY,
  integrations: [
    'jira',
    'youtrack',
    'linear',
    'notion',
    'github',
    'slack',
    'telegram',
  ] as const,
} satisfies PlanLimits;

export const TEAM_LIMITS = {
  bugReportsPerDay: Number.POSITIVE_INFINITY,
  bugReportStorageDays: 365,
  networkProfiles: Number.POSITIVE_INFINITY,
  sessionsPerDay: Number.POSITIVE_INFINITY,
  customSnippets: Number.POSITIVE_INFINITY,
  integrations: ['all'] as const,
  teamMembers: 10,
} satisfies PlanLimits;

export function getLimitsForPlan(plan: UserPlan): PlanLimits {
  switch (plan) {
    case 'free':
      return FREE_LIMITS;
    case 'pro':
      return PRO_LIMITS;
    case 'team':
      return TEAM_LIMITS;
    default: {
      const exhaustive: never = plan;
      return exhaustive;
    }
  }
}
