import { Injectable, computed, inject, signal } from '@angular/core';
import { AcademyDataService } from '../../../services/academy-data.service';
import {
  AdminDashboardMetrics,
  InstitutionalReportRow,
  LicenseSummary,
  ServerNodeStatus,
  SystemLogEntry,
} from '../data/admin-api.contracts';

/**
 * Métricas de plataforma. Datos mock alineados al dashboard Figma;
 * sustituir por GET /api/admin/* en integración backend.
 */
@Injectable({ providedIn: 'root' })
export class AdminPlatformService {
  private readonly data = inject(AcademyDataService);
  private readonly logSeed = signal<SystemLogEntry[]>(this.buildInitialLogs());

  readonly metrics = computed<AdminDashboardMetrics>(() => {
    this.data.store();
    const teachers = this.data.allTeachers().filter((user) => user.status === 'ACTIVE').length;
    const students = this.data.allStudents().filter((user) => user.status === 'ACTIVE').length;
    const managed = teachers + students;
    return {
      activeNodes: '12 / 12',
      activeNodesStatus: this.data.isEmergencyLockoutActive() ? 'critical' : 'stable',
      managedUsers: managed,
      userGrowthPercent: 12,
      activeLicenses: Math.max(85, Math.round(managed * 0.07)),
      syncAlerts: this.data.isEmergencyLockoutActive() ? 3 : 0,
    };
  });

  readonly serverNodes = signal<ServerNodeStatus[]>([
    { id: 'alpha', name: 'Nodo Alpha', location: 'Bogotá DC', latencyMs: 12, loadPercent: 42, status: 'online' },
    { id: 'beta', name: 'Nodo Beta', location: 'Medellín', latencyMs: 18, loadPercent: 67, status: 'online' },
    { id: 'gamma', name: 'Nodo Gamma', location: 'Cali', latencyMs: 0, loadPercent: 0, status: 'maintenance' },
  ]);

  readonly licenseSummary = signal<LicenseSummary>({
    totalIssued: 142,
    expiringSoon: 8,
    expiringLabel: '8 licencias vencen en los próximos 30 días',
  });

  readonly institutionalReports = signal<InstitutionalReportRow[]>([
    { institution: 'Universidad Nacional', sessions: 420, efficiencyPercent: 94, statusLabel: 'Premium', statusTone: 'premium' },
    { institution: 'UniGermana', sessions: 210, efficiencyPercent: 88, statusLabel: 'Full Access', statusTone: 'full' },
    { institution: 'Campus Piloto', sessions: 56, efficiencyPercent: 72, statusLabel: 'Trial', statusTone: 'trial' },
  ]);

  readonly logs = computed(() => {
    this.data.store();
    const lockout = this.data.isEmergencyLockoutActive();
    const base = this.logSeed();
    if (!lockout) {
      return base;
    }
    return [
      {
        timestamp: new Date().toISOString(),
        level: 'error' as const,
        message: 'EMERGENCY_LOCKOUT activo — sesiones docentes suspendidas',
      },
      ...base,
    ];
  });

  appendLog(entry: SystemLogEntry): void {
    this.logSeed.update((items) => [entry, ...items].slice(0, 40));
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

  private buildInitialLogs(): SystemLogEntry[] {
    return [
      { timestamp: '2026-05-26T13:00:00Z', level: 'info', message: 'Sincronización de nodos completada' },
      { timestamp: '2026-05-26T12:45:00Z', level: 'info', message: 'Catálogo académico indexado correctamente' },
      { timestamp: '2026-05-26T12:30:00Z', level: 'warn', message: 'Nodo Gamma en mantenimiento programado' },
      { timestamp: '2026-05-26T12:00:00Z', level: 'info', message: 'REQ-01: política de roles verificada' },
    ];
  }
}
