export type SessionStatus = 'recording' | 'paused' | 'completed' | 'failed';

/** Запись тестовой сессии (Session Recorder), не путать с HTTP-сессией. */
export interface Session {
  id: string;
  userId: string;
  title: string;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  /** Длительность в секундах, если запись завершена */
  durationSeconds: number | null;
}
