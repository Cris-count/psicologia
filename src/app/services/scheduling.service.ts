import { Injectable, inject } from '@angular/core';
import { TaskDraft, ScheduleTaskResult, UpdateAuthorizedListResult, AuthorizedListDraft } from '../models/academy.models';
import { SessionAuthorization } from '../models/session.models';
import { AcademyDataService } from './academy-data.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class SchedulingService {
  private readonly data = inject(AcademyDataService);
  private readonly notify = inject(NotificationService);

  scheduleAndNotify(draft: TaskDraft): Promise<ScheduleTaskResult> {
    const result = this.data.scheduleTaskToGroup(draft);
    if (!result.ok) {
      return Promise.resolve(result);
    }

    const situation = this.data.situationForTask(result.task);
    const accessUrl = this.accessUrl();
    const sends = result.authorizations.map((auth) => this.notifyCredentials(auth, result, situation?.title ?? 'Caso', accessUrl));
    return Promise.all(sends).then(() => result);
  }

  /** REQ-05 — actualiza autorizados y notifica solo a los afectados. */
  async updateAuthorizedAndNotify(taskId: string, draft: AuthorizedListDraft): Promise<UpdateAuthorizedListResult> {
    const result = this.data.updateSessionAuthorizedStudents(taskId, draft);
    if (!result.ok) {
      return result;
    }

    const situation = this.data.situationForTask(result.task);
    const caseTitle = situation?.title ?? 'Caso';
    const accessUrl = this.accessUrl();
    const session = result.session;

    for (const studentId of result.addedStudentIds) {
      const student = this.data.userById(studentId);
      if (!student) continue;
      await this.notify.notifyStudentAddedToSimulation({
        studentEmail: student.email,
        studentName: student.name,
        caseTitle,
        documentId: this.data.documentIdForStudent(studentId),
        accessUrl,
        academicSpace: session.academicSpace ?? '',
        scheduledStartAt: session.scheduledStartAt,
        scheduledEndAt: session.scheduledEndAt,
      });
    }

    for (const studentId of result.removedStudentIds) {
      const student = this.data.userById(studentId);
      if (!student) continue;
      await this.notify.notifyStudentRemovedFromSimulation(student.email, student.name, caseTitle);
    }

    return result;
  }

  private accessUrl(): string {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/login`;
    }
    return 'http://localhost:4200/login';
  }

  private async notifyCredentials(
    auth: SessionAuthorization,
    result: Extract<ScheduleTaskResult, { ok: true }>,
    caseTitle: string,
    accessUrl: string,
  ): Promise<void> {
    const student = this.data.userById(auth.studentId);
    if (!student) return;
    await this.notify.notifyScheduleCredentials({
      studentEmail: student.email,
      studentName: student.name,
      caseTitle,
      documentId: this.data.documentIdForStudent(auth.studentId),
      accessUrl,
      academicSpace: result.session.academicSpace ?? '',
      location: result.session.location ?? '',
      scheduledStartAt: result.session.scheduledStartAt,
      scheduledEndAt: result.session.scheduledEndAt,
      maxDurationMinutes: result.session.maxDurationMinutes,
      customMessage: result.session.customMessage,
    });
  }
}
