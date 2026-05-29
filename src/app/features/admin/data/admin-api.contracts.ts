import { User, UserRole, UserStatus } from '../../../models/academy.models';

export interface AdminDashboardMetrics {
  activeNodes: string;
  activeNodesStatus: 'stable' | 'warning' | 'critical';
  managedUsers: number;
  userGrowthPercent: number;
  activeLicenses: number;
  syncAlerts: number;
}

export interface ServerNodeStatus {
  id: string;
  name: string;
  location: string;
  latencyMs: number;
  loadPercent: number;
  status: 'online' | 'maintenance' | 'offline';
}

export interface LicenseSummary {
  totalIssued: number;
  expiringSoon: number;
  expiringLabel: string;
}

export interface InstitutionalReportRow {
  institution: string;
  sessions: number;
  efficiencyPercent: number;
  statusLabel: string;
  statusTone: 'premium' | 'full' | 'trial';
}

export interface SystemLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface CreateTeacherDto {
  name: string;
  email: string;
  password: string;
  institution: string;
  area: string;
  canCreateCases: boolean;
}

export interface CreateStudentDto {
  name: string;
  email: string;
  password: string;
  code: string;
}

export interface AdminUserRow {
  user: User;
  role: UserRole;
  status: UserStatus;
  canCreateCases?: boolean;
  institution?: string;
  area?: string;
  studentCode?: string;
}
