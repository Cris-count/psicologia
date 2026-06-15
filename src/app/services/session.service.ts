import { Injectable, inject } from '@angular/core';

import { GroupTask } from '../models/academy.models';

import { StudentTaskAccess, TaskSession } from '../models/session.models';

import { AcademyDataService } from './academy-data.service';



@Injectable({ providedIn: 'root' })

export class SessionService {

  private readonly data = inject(AcademyDataService);



  sessionForTask(taskId: string): TaskSession | undefined {

    return this.data.sessionForTask(taskId);

  }



  /** REQ-07 — acceso según ventana oficial, autorización y umbral 50%. */

  canStudentAccessTask(studentId: string, taskId: string): StudentTaskAccess {

    const session = this.data.sessionForTask(taskId);

    if (!session) {

      return { allowed: true };

    }



    if (this.data.isStudentBlockedForTask(studentId, taskId)) {

      return {

        allowed: false,

        reason: 'Tu acceso fue bloqueado: superaste el 50% del tiempo programado (REQ-07).',

        session,

      };

    }



    if (session.authorizedStudentIds?.length && !session.authorizedStudentIds.includes(studentId)) {

      return { allowed: false, reason: 'No estás en la lista de autorizados de esta simulación.', session };

    }



    const now = Date.now();

    if (session.status === 'FINISHED') {

      return { allowed: false, reason: 'La sesión del caso ya finalizó.', session };

    }

    if (now < new Date(session.scheduledStartAt).getTime()) {

      return { allowed: false, reason: 'La ventana de acceso aún no abre.', session };

    }

    if (now > new Date(session.scheduledEndAt).getTime()) {

      return { allowed: false, reason: 'La ventana de acceso expiró.', session };

    }



    if (this.isPastHalfDuration(session)) {

      this.data.permanentlyBlockStudentAccess(studentId, taskId);

      return {

        allowed: false,

        reason: 'Superaste el 50% del tiempo máximo desde el inicio oficial (REQ-07). Acceso bloqueado.',

        session,

      };

    }



    return { allowed: true, session };

  }



  canStudentRetry(studentId: string, taskId: string): boolean {

    const progress = this.data.progressFor(studentId, taskId);

    const attempt = this.data.attemptForStudentTask(studentId, taskId);

    if (!progress.completed && !attempt) return true;

    const session = this.data.sessionForTask(taskId);

    const authorized = session?.retryAuthorizedStudentIds ?? [];

    if (authorized.includes(studentId)) return true;

    return session?.allowRetries ?? false;

  }



  elapsedMinutesFromOfficialStart(session: TaskSession): number {

    const start = new Date(session.scheduledStartAt).getTime();

    if (!Number.isFinite(start)) return 0;

    return Math.max(0, Math.floor((Date.now() - start) / 60000));

  }



  remainingMinutes(session: TaskSession): number {

    return Math.max(0, session.maxDurationMinutes - this.elapsedMinutesFromOfficialStart(session));

  }



  timerLabel(session: TaskSession | undefined): string | null {

    if (!session || session.status === 'FINISHED') return null;

    const remaining = this.remainingMinutes(session);

    const elapsed = this.elapsedMinutesFromOfficialStart(session);

    const rm = String(remaining).padStart(2, '0');

    const em = String(elapsed).padStart(2, '0');

    return `${em}:${rm} · ${session.maxDurationMinutes} min`;

  }



  /** REQ-07 — 50% del tiempo máximo contado desde scheduledStartAt (inicio oficial). */

  isPastHalfDuration(session: TaskSession): boolean {

    const officialStart = new Date(session.scheduledStartAt).getTime();

    if (!Number.isFinite(officialStart)) return false;

    const halfMs = session.maxDurationMinutes * 0.5 * 60_000;

    return Date.now() - officialStart > halfMs;

  }



  defaultScheduleForTask(task: GroupTask, teacherId: string, estimatedMinutes = 90): Omit<TaskSession, 'id' | 'createdAt' | 'updatedAt'> {

    const start = new Date();

    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {

      taskId: task.id,

      groupId: task.groupId,

      situationId: task.situationId,

      teacherId,

      scheduledStartAt: start.toISOString(),

      scheduledEndAt: end.toISOString(),

      maxDurationMinutes: Math.min(Math.max(estimatedMinutes, 30), estimatedMinutes),

      estimatedMinutes,

      status: 'NOT_STARTED',

      allowRetries: false,

    };

  }

}

