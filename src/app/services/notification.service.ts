import { Injectable, inject } from '@angular/core';
import { NotificationRecord, NotificationType } from '../models/session.models';
import { AcademyDataService } from './academy-data.service';

const TYPE_LABELS: Record<NotificationType, string> = {
  TASK_ASSIGNED: 'Nueva tarea',
  STUDENT_LIST_CHANGED: 'Cambio de acceso',
  SESSION_STARTED: 'Sesión iniciada',
  RESULTS_READY: 'Resultados disponibles',
  TEACHER_FEEDBACK: 'Feedback docente',
  SCHEDULE_CREDENTIALS: 'Credenciales de simulación',
};

/** REQ-04/05/09 — notificaciones por correo real (SMTP) + bandeja in-app. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly data = inject(AcademyDataService);

  async queue(type: NotificationType, recipientEmail: string, subject: string, body: string): Promise<NotificationRecord> {
    const record = this.data.queueNotification({ type, recipientEmail, subject, body });
    await this.dispatchEmail(record);
    return record;
  }

  notifyTaskAssigned(studentEmail: string, groupName: string, caseTitle: string): Promise<NotificationRecord> {
    return this.queue(
      'TASK_ASSIGNED',
      studentEmail,
      `Nueva tarea en ${groupName}`,
      `Se te asignó el caso «${caseTitle}». Ingresa a MIND-SPHERE cuando el docente inicie la sesión.`,
    );
  }

  notifySessionStarted(studentEmail: string, caseTitle: string, message?: string): Promise<NotificationRecord> {
    return this.queue(
      'SESSION_STARTED',
      studentEmail,
      `Sesión iniciada: ${caseTitle}`,
      message ?? `El docente abrió la sesión del caso «${caseTitle}». Ya puedes ingresar al simulador.`,
    );
  }

  notifyResultsReady(studentEmail: string, caseTitle: string, nota: number): Promise<NotificationRecord> {
    return this.queue(
      'RESULTS_READY',
      studentEmail,
      `Resultados: ${caseTitle}`,
      `Tu calificación final es ${nota.toFixed(1)} / 5.0. Revisa el resumen en MIND-SPHERE.`,
    );
  }

  notifyTeacherFeedback(studentEmail: string, caseTitle: string, comment: string): Promise<NotificationRecord> {
    return this.queue(
      'TEACHER_FEEDBACK',
      studentEmail,
      `Feedback docente: ${caseTitle}`,
      `Tu profesor dejó comentarios sobre «${caseTitle}»:\n\n${comment}`,
    );
  }

  /** REQ-05 — el estudiante ve esto en su bandeja al ser agregado a un grupo. */
  notifyStudentAddedToGroup(
    studentEmail: string,
    groupName: string,
    documentId: string,
    teacherName?: string,
  ): Promise<NotificationRecord> {
    const accessUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'http://localhost:4200/login';
    return this.queue(
      'STUDENT_LIST_CHANGED',
      studentEmail,
      `Te agregaron al grupo ${groupName}`,
      teacherName
        ? `${teacherName} te inscribió en «${groupName}».\n\nIngresa a MIND-SPHERE:\nURL: ${accessUrl}\nCorreo: ${studentEmail}\nTarjeta de identidad: ${documentId}`
        : `Fuiste agregado al grupo «${groupName}».\n\nIngresa a MIND-SPHERE:\nURL: ${accessUrl}\nCorreo: ${studentEmail}\nTarjeta de identidad: ${documentId}`,
    );
  }

  /** REQ-05 — estudiante agregado a la lista de autorizados de una simulación ya agendada. */
  notifyStudentAddedToSimulation(params: {
    studentEmail: string;
    studentName: string;
    caseTitle: string;
    documentId: string;
    accessUrl: string;
    academicSpace: string;
    scheduledStartAt: string;
    scheduledEndAt: string;
  }): Promise<NotificationRecord> {
    const start = new Date(params.scheduledStartAt).toLocaleString('es-CO');
    const end = new Date(params.scheduledEndAt).toLocaleString('es-CO');
    return this.queue(
      'STUDENT_LIST_CHANGED',
      params.studentEmail,
      `Acceso autorizado: ${params.caseTitle}`,
      `Hola ${params.studentName},

Fuiste agregado a la simulación «${params.caseTitle}» (${params.academicSpace}).

Inicio oficial: ${start}
Fin programado: ${end}

URL de acceso: ${params.accessUrl}
Correo universitario: ${params.studentEmail}
Tarjeta de identidad: ${params.documentId}

Ingresa con tu correo universitario y tu tarjeta de identidad cuando el docente inicie la sesión.`,
    );
  }

  /** REQ-05 — estudiante retirado de la lista de autorizados. */
  notifyStudentRemovedFromSimulation(
    studentEmail: string,
    studentName: string,
    caseTitle: string,
  ): Promise<NotificationRecord> {
    return this.queue(
      'STUDENT_LIST_CHANGED',
      studentEmail,
      `Acceso revocado: ${caseTitle}`,
      `Hola ${studentName},

Fuiste retirado de la lista de autorizados para la simulación «${caseTitle}».

Ya no podrás ingresar a este caso agendado. Si crees que es un error, contacta a tu docente.`,
    );
  }

  notifyScheduleCredentials(params: {
    studentEmail: string;
    studentName: string;
    caseTitle: string;
    documentId: string;
    accessUrl: string;
    academicSpace: string;
    location: string;
    scheduledStartAt: string;
    scheduledEndAt: string;
    maxDurationMinutes: number;
    customMessage?: string;
  }): Promise<NotificationRecord> {
    const start = new Date(params.scheduledStartAt).toLocaleString('es-CO');
    const end = new Date(params.scheduledEndAt).toLocaleString('es-CO');
    const messageBlock = params.customMessage ? `\n\nMensaje del docente:\n${params.customMessage}` : '';
    return this.queue(
      'SCHEDULE_CREDENTIALS',
      params.studentEmail,
      `Simulación agendada: ${params.caseTitle}`,
      `Hola ${params.studentName},

Fuiste invitado a la simulación «${params.caseTitle}».

Espacio académico: ${params.academicSpace}
Ubicación: ${params.location}
Inicio oficial: ${start}
Fin programado: ${end}
Tiempo máximo: ${params.maxDurationMinutes} minutos${messageBlock}

URL de acceso: ${params.accessUrl}
Correo universitario: ${params.studentEmail}
Tarjeta de identidad: ${params.documentId}

Ingresa con tu correo universitario y tu tarjeta de identidad.`,
    );
  }

  notificationsForEmail(email: string): NotificationRecord[] {
    return this.data.notificationsForEmail(email);
  }

  unreadCount(email: string): number {
    return this.data.unreadNotificationCount(email);
  }

  markRead(notificationId: string): void {
    this.data.markNotificationRead(notificationId);
  }

  private async dispatchEmail(record: NotificationRecord): Promise<void> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: record.recipientEmail,
          subject: record.subject,
          body: record.body,
          type: TYPE_LABELS[record.type] ?? 'Notificación',
        }),
      });

      if (response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { sentAt?: string };
        this.data.markNotificationSent(record.id, payload.sentAt);
        return;
      }

      // Sin SMTP configurado: la notificación in-app ya quedó guardada; no marcar error.
      if (response.status === 503) {
        return;
      }

      const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      this.data.markNotificationFailed(record.id, payload.message ?? payload.error ?? 'Error SMTP');
    } catch {
      // API no disponible (dev sin Docker): la bandeja in-app sigue funcionando.
    }
  }
}
