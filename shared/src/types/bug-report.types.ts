import type { Severity } from './severity.types';

export interface BugReport {
  id: string;
  userId: string;
  title: string;
  description: string;
  severity: Severity;
  /** URL страницы воспроизведения */
  pageUrl: string;
  /** Краткое описание окружения (браузер, ОС) — текст или сериализованный JSON */
  environmentSummary: string | null;
  createdAt: string;
  updatedAt: string;
}
