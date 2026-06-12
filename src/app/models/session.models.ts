/** REQ-04 / REQ-06 — agenda e inicio de sesión docente por tarea. */
export type TaskSessionStatus = 'SCHEDULED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED';

export interface TaskSession {
  id: string;
  taskId: string;
  groupId: string;
  situationId: string;
  teacherId: string;
  /** Espacio académico (REQ-04). */
  academicSpace?: string;
  /** Ubicación física o virtual (REQ-04). */
  location?: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  /** Tiempo máximo de participación (minutos). REQ-04 */
  maxDurationMinutes: number;
  /** Tiempo estimado inicial del caso (minutos). REQ-04 */
  estimatedMinutes: number;
  customMessage?: string;
  status: TaskSessionStatus;
  startedAt?: string;
  finishedAt?: string;
  /** Estudiantes autorizados para esta simulación agendada. */
  authorizedStudentIds?: string[];
  /** REQ-12 — reintentos solo si el docente lo autoriza. */
  allowRetries: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Credencial única por estudiante y simulación agendada (REQ-04 / REQ-07). */
export interface SessionAuthorization {
  id: string;
  sessionId: string;
  taskId: string;
  studentId: string;
  /** Código único de autenticación enviado por correo. */
  authCode: string;
  /** Bloqueo definitivo por superar 50% del tiempo (REQ-07). */
  blockedAt?: string;
  createdAt: string;
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'STUDENT_LIST_CHANGED'
  | 'SESSION_STARTED'
  | 'RESULTS_READY'
  | 'TEACHER_FEEDBACK'
  | 'SCHEDULE_CREDENTIALS';

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  recipientEmail: string;
  subject: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  createdAt: string;
  sentAt?: string;
  /** Marca de lectura in-app por el estudiante. */
  readAt?: string;
  deliveryError?: string;
}

export interface StudentTaskAccess {
  allowed: boolean;
  reason?: string;
  session?: TaskSession;
}
