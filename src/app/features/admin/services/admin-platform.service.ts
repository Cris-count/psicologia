import { Injectable, computed, inject, signal } from '@angular/core';
import { AcademyDataService } from '../../../services/academy-data.service';
import {
  AdminDashboardMetrics,
  InstitutionalReportRow,
  LicenseSummary,
  ServerNodeStatus,
  SystemLogEntry,
} from '../data/admin-api.contracts';

@Injectable({ providedIn: 'root' })
export class AdminPlatformService {
  private readonly data = inject(AcademyDataService);
  private readonly manualLogs = signal<SystemLogEntry[]>([]);

  readonly metrics = computed<AdminDashboardMetrics>(() => {
    const store = this.data.store();
    const managedUsers = store.users.filter((user) => user.role !== 'SUPERADMIN').length;
    const activeModules = this.moduleStatusRows().filter((node) => node.status === 'online').length;
    const totalModules = this.moduleStatusRows().length;
    const inactiveUsers = store.users.filter((user) => user.role !== 'SUPERADMIN' && user.status === 'INACTIVE').length;
    const hasEmptyCoreData =
      !store.users.length ||
      !store.groups.length ||
      !store.situations.length ||
      !store.groupTasks.length;

    return {
      activeNodes: `${activeModules} / ${totalModules}`,
      activeNodesStatus: this.data.isEmergencyLockoutActive() || hasEmptyCoreData ? 'warning' : 'stable',
      managedUsers,
      userGrowthPercent: this.completionPercent(store.studentProgress),
      activeLicenses: store.users.filter((user) => user.status === 'ACTIVE').length,
      syncAlerts: inactiveUsers + (this.data.isEmergencyLockoutActive() ? 1 : 0),
    };
  });

  readonly serverNodes = computed<ServerNodeStatus[]>(() => this.moduleStatusRows());

  readonly licenseSummary = computed<LicenseSummary>(() => {
    const store = this.data.store();
    const activeUsers = store.users.filter((user) => user.status === 'ACTIVE').length;
    const inactiveUsers = store.users.filter((user) => user.status === 'INACTIVE').length;
    return {
      totalIssued: store.users.length,
      expiringSoon: inactiveUsers,
      expiringLabel: inactiveUsers
        ? `${inactiveUsers} usuarios inactivos requieren revision`
        : `${activeUsers} usuarios activos sin alertas de licencia`,
    };
  });

  readonly institutionalReports = computed<InstitutionalReportRow[]>(() => {
    const store = this.data.store();
    const institutions = new Map<
      string,
      { teacherIds: Set<string>; studentIds: Set<string>; taskIds: Set<string>; progress: number[] }
    >();

    for (const profile of store.teacherProfiles) {
      const institution = profile.institution || 'Sin institucion';
      const row = institutions.get(institution) ?? {
        teacherIds: new Set<string>(),
        studentIds: new Set<string>(),
        taskIds: new Set<string>(),
        progress: [],
      };
      row.teacherIds.add(profile.userId);
      institutions.set(institution, row);
    }

    for (const group of store.groups) {
      const teacherProfile = store.teacherProfiles.find((profile) => profile.userId === group.teacherId);
      const institution = teacherProfile?.institution || 'Sin institucion';
      const row = institutions.get(institution) ?? {
        teacherIds: new Set<string>(),
        studentIds: new Set<string>(),
        taskIds: new Set<string>(),
        progress: [],
      };
      row.teacherIds.add(group.teacherId);

      for (const membership of store.groupStudents.filter((item) => item.groupId === group.id)) {
        row.studentIds.add(membership.studentId);
      }

      for (const task of store.groupTasks.filter((item) => item.groupId === group.id)) {
        row.taskIds.add(task.id);
        for (const progress of store.studentProgress.filter((item) => item.taskId === task.id)) {
          row.progress.push(progress.progressPercentage);
        }
      }

      institutions.set(institution, row);
    }

    return [...institutions.entries()]
      .map(([institution, row]) => {
        const sessions = row.taskIds.size + row.progress.length;
        const efficiencyPercent = row.progress.length
          ? Math.round(row.progress.reduce((sum, value) => sum + value, 0) / row.progress.length)
          : 0;
        const statusTone: 'premium' | 'full' | 'trial' =
          efficiencyPercent >= 80 ? 'premium' : sessions > 0 ? 'full' : 'trial';
        return {
          institution,
          sessions,
          efficiencyPercent,
          statusLabel: statusTone === 'premium' ? 'Alto uso' : statusTone === 'full' ? 'En uso' : 'Sin progreso',
          statusTone,
        };
      })
      .sort((a, b) => b.sessions - a.sessions || a.institution.localeCompare(b.institution));
  });

  readonly logs = computed(() => {
    const store = this.data.store();
    const generated: SystemLogEntry[] = [
      {
        timestamp: store.platformSettings?.updatedAt ?? new Date().toISOString(),
        level: this.data.isEmergencyLockoutActive() ? 'error' : 'info',
        message: this.data.isEmergencyLockoutActive()
          ? 'Bloqueo de emergencia activo'
          : 'Bloqueo de emergencia inactivo',
      },
      {
        timestamp: this.latestTimestamp(store.users.map((item) => item.updatedAt || item.createdAt)),
        level: 'info',
        message: `${store.users.length} usuarios registrados en el sistema`,
      },
      {
        timestamp: this.latestTimestamp(store.situations.map((item) => item.updatedAt || item.createdAt)),
        level: store.situations.some((item) => item.status === 'DRAFT') ? 'warn' : 'info',
        message: `${store.situations.length} casos en catalogo, ${
          store.situations.filter((item) => item.status === 'PUBLISHED').length
        } publicados`,
      },
      {
        timestamp: this.latestTimestamp(store.groupTasks.map((item) => item.assignedAt)),
        level: 'info',
        message: `${store.groupTasks.length} tareas asignadas a grupos`,
      },
    ];

    return [...this.manualLogs(), ...generated].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 40);
  });

  appendLog(entry: SystemLogEntry): void {
    this.manualLogs.update((items) => [entry, ...items].slice(0, 20));
  }

  triggerEmergencyLockout(): void {
    const active = !this.data.isEmergencyLockoutActive();
    this.data.setEmergencyLockout(active);
    this.appendLog({
      timestamp: new Date().toISOString(),
      level: active ? 'error' : 'info',
      message: active ? 'Bloqueo de emergencia ACTIVADO por administrador' : 'Bloqueo de emergencia DESACTIVADO',
    });
  }

  private moduleStatusRows(): ServerNodeStatus[] {
    const store = this.data.store();
    const activeUsers = store.users.filter((user) => user.status === 'ACTIVE').length;
    const inactiveUsers = store.users.filter((user) => user.status === 'INACTIVE').length;
    const publishedSituations = store.situations.filter((item) => item.status === 'PUBLISHED').length;
    const draftSituations = store.situations.filter((item) => item.status === 'DRAFT').length;
    const activeGroups = store.groups.filter((group) => group.status === 'ACTIVE').length;
    const completedProgress = store.studentProgress.filter((progress) => progress.completed).length;

    return [
      {
        id: 'users',
        name: 'Usuarios y permisos',
        location: `${activeUsers} activos · ${inactiveUsers} inactivos`,
        latencyMs: 0,
        loadPercent: this.percent(activeUsers, Math.max(store.users.length, 1)),
        status: activeUsers ? 'online' : 'offline',
      },
      {
        id: 'content',
        name: 'Catalogo academico',
        location: `${publishedSituations} publicados · ${draftSituations} borradores`,
        latencyMs: 0,
        loadPercent: this.percent(publishedSituations, Math.max(store.situations.length, 1)),
        status: publishedSituations ? 'online' : store.situations.length ? 'maintenance' : 'offline',
      },
      {
        id: 'groups',
        name: 'Grupos y tareas',
        location: `${activeGroups} grupos activos · ${store.groupTasks.length} tareas`,
        latencyMs: 0,
        loadPercent: this.percent(store.groupTasks.length, Math.max(activeGroups, 1)),
        status: activeGroups && store.groupTasks.length ? 'online' : activeGroups ? 'maintenance' : 'offline',
      },
      {
        id: 'progress',
        name: 'Respuestas y progreso',
        location: `${store.studentAnswers.length} respuestas · ${completedProgress} progresos completos`,
        latencyMs: 0,
        loadPercent: this.completionPercent(store.studentProgress),
        status: store.studentProgress.length || store.studentAnswers.length ? 'online' : 'maintenance',
      },
    ];
  }

  private percent(value: number, total: number): number {
    return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
  }

  private completionPercent(progressRows: Array<{ progressPercentage: number }>): number {
    if (!progressRows.length) return 0;
    return Math.round(progressRows.reduce((sum, item) => sum + item.progressPercentage, 0) / progressRows.length);
  }

  private latestTimestamp(values: string[]): string {
    return values.filter(Boolean).sort((a, b) => b.localeCompare(a))[0] ?? new Date().toISOString();
  }
}
