import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { DEFAULT_AVATAR_ID, normalizeAvatarId } from '../shared/guide/data/avatar.catalog';
import {
  DEFAULT_TEACHER_AVATAR_ID,
  normalizeTeacherAvatarId,
} from '../shared/guide/data/teacher-avatar.catalog';
import {
  AcademyStore,
  AnswerOption,
  AvatarAccessories,
  AvatarAppearance,
  AvatarId,
  TeacherAvatarId,
  Difficulty,
  GameGroup,
  GroupTask,
  GroupStudent,
  Question,
  QuestionCategory,
  QuestionDraft,
  Scenario,
  Situation,
  SituationStatus,
  StudentAnswer,
  StudentProgress,
  SituationDraft,
  ScenarioDraft,
  TaskDraft,
  ScheduleTaskResult,
  User,
} from '../models/academy.models';
import { GLOBAL_RUBRIC_ID, IntentoEstudiante, RubricaEvaluacion } from '../models/evaluation.models';
import { NotificationRecord, NotificationType, SessionAuthorization, TaskSession, TaskSessionStatus } from '../models/session.models';
import { normalizeAccessories } from '../shared/guide/data/accessory.catalog';
import { normalizeAppearance } from '../shared/guide/data/appearance.catalog';
import { migrateLegacyLook, normalizeAvatarLook } from '../shared/guide/data/avatar-studio.catalog';
import {
  DEMO_CASE_INTRO,
  DEMO_SCENARIO_CONTEXT,
} from '../features/student/mission/mission-case-content';
import type { AvatarLook } from '../shared/guide/data/avatar-look.types';

const STORE_KEY = 'academic-case-simulator-store-v8';
const STORE_API_URL = '/api/store';

/** Credenciales demo: reinicio del simulador estudiante. */
export const DEMO_STUDENT_ID = 'usr-student-demo';
export const DEMO_TASK_ID = 'tsk-demo';

@Injectable({ providedIn: 'root' })
export class AcademyDataService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly state = signal<AcademyStore>(this.loadInitialStore());
  private readonly readyState = signal(false);
  readonly store = this.state.asReadonly();
  readonly storeReady = this.readyState.asReadonly();
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.loadDockerStore().finally(() => {
      this.processExpiredSessions();
      this.readyState.set(true);
    });
  }

  get users(): User[] {
    return this.store().users;
  }

  authenticate(email: string, password: string): User | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    return this.users.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.password === password && user.status === 'ACTIVE',
    );
  }

  userByEmail(email: string): User | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    return this.store().users.find((u) => u.email.toLowerCase() === normalizedEmail && u.status === 'ACTIVE');
  }

  /** REQ-07 — estudiante: correo universitario + tarjeta de identidad. */
  authenticateStudentWithDocument(email: string, documentId: string): User | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDoc = this.normalizeDocumentId(documentId);
    if (!normalizedDoc) return undefined;

    const user = this.store().users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.role === 'STUDENT' && u.status === 'ACTIVE',
    );
    if (!user) return undefined;

    const profile = this.studentProfileFor(user.id);
    if (!profile || this.normalizeDocumentId(profile.code) !== normalizedDoc) {
      return undefined;
    }
    return user;
  }

  normalizeDocumentId(value: string): string {
    return String(value ?? '')
      .trim()
      .replace(/[\s.\-]/g, '')
      .toLowerCase();
  }

  documentIdForStudent(studentId: string): string {
    return this.studentProfileFor(studentId)?.code ?? '';
  }

  groupsByTeacher(teacherId: string): GameGroup[] {
    return this.store().groups.filter((group) => group.teacherId === teacherId);
  }

  studentsByTeacher(teacherId: string): User[] {
    const groupIds = new Set(this.groupsByTeacher(teacherId).map((group) => group.id));
    const studentIds = new Set(
      this.store()
        .groupStudents.filter((membership) => groupIds.has(membership.groupId))
        .map((membership) => membership.studentId),
    );
    return this.store().users.filter((user) => user.role === 'STUDENT' && studentIds.has(user.id));
  }

  allStudents(): User[] {
    return this.store().users.filter((user) => user.role === 'STUDENT');
  }

  allTeachers(): User[] {
    return this.store().users.filter((user) => user.role === 'TEACHER');
  }

  teacherProfileFor(userId: string) {
    return this.store().teacherProfiles.find((profile) => profile.userId === userId);
  }

  createTeacher(
    name: string,
    email: string,
    password: string,
    institution: string,
    area: string,
    canCreateCases: boolean,
  ): User {
    const now = new Date().toISOString();
    const user: User = {
      id: this.id('usr'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'TEACHER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    this.commit({
      ...this.store(),
      users: [user, ...this.store().users],
      teacherProfiles: [
        {
          id: this.id('tpr'),
          userId: user.id,
          institution: institution.trim(),
          area: area.trim(),
          canCreateCases,
          createdAt: now,
        },
        ...this.store().teacherProfiles,
      ],
    });
    return user;
  }

  setUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): void {
    this.commit({
      ...this.store(),
      users: this.store().users.map((user) =>
        user.id === userId ? { ...user, status, updatedAt: new Date().toISOString() } : user,
      ),
    });
  }

  setTeacherCanCreateCases(userId: string, canCreateCases: boolean): void {
    this.commit({
      ...this.store(),
      teacherProfiles: this.store().teacherProfiles.map((profile) =>
        profile.userId === userId ? { ...profile, canCreateCases } : profile,
      ),
    });
  }

  updateTeacherGameProfile(
    userId: string,
    patch: {
      avatarId?: TeacherAvatarId;
      characterName?: string;
      avatarConfigured?: boolean;
    },
  ): boolean {
    const profile = this.teacherProfileFor(userId);
    if (!profile) return false;
    if (patch.characterName !== undefined && patch.characterName.trim().length < 2) return false;
    this.commit({
      ...this.store(),
      teacherProfiles: this.store().teacherProfiles.map((p) =>
        p.userId === userId
          ? {
              ...p,
              ...patch,
              characterName:
                patch.characterName !== undefined ? patch.characterName.trim() : p.characterName,
            }
          : p,
      ),
    });
    return true;
  }

  isEmergencyLockoutActive(): boolean {
    return Boolean(this.store().platformSettings?.emergencyLockout);
  }

  setEmergencyLockout(active: boolean): void {
    this.commit({
      ...this.store(),
      platformSettings: {
        ...this.store().platformSettings,
        emergencyLockout: active,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  /** Catálogo publicado visible para maestros al crear tareas. */
  catalogSituations(): Situation[] {
    return this.store().situations.filter((situation) => situation.status === 'PUBLISHED');
  }

  /** Casos publicados disponibles para un maestro (propios + catálogo global). */
  catalogSituationsForTeacher(teacherId: string): Situation[] {
    return this.store()
      .situations.filter(
        (situation) => situation.status === 'PUBLISHED' && this.isSituationAccessibleToTeacher(situation, teacherId),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  /** Casos visibles en el módulo docente: propios + catálogo de plataforma (superadmin). */
  situationsForTeacher(teacherId: string): Situation[] {
    return this.store()
      .situations.filter((situation) => this.isSituationAccessibleToTeacher(situation, teacherId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  situationsByTeacher(teacherId: string): Situation[] {
    return this.store()
      .situations.filter((s) => s.createdById === teacherId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  isSituationOwnedByTeacher(situationId: string, teacherId: string): boolean {
    const situation = this.getSituation(situationId);
    return situation?.createdById === teacherId;
  }

  private isSituationAccessibleToTeacher(situation: Situation, teacherId: string): boolean {
    if (situation.createdById === teacherId) return true;
    const creator = this.store().users.find((u) => u.id === situation.createdById);
    return creator?.role === 'SUPERADMIN';
  }

  canTeacherCreateCases(teacherId: string): boolean {
    return Boolean(this.teacherProfileFor(teacherId)?.canCreateCases);
  }

  getSituation(situationId: string): Situation | undefined {
    return this.store().situations.find((s) => s.id === situationId);
  }

  createSituationForTeacher(teacherId: string, draft: SituationDraft): Situation | undefined {
    if (!this.canTeacherCreateCases(teacherId)) return undefined;
    const now = new Date().toISOString();
    const situation: Situation = {
      id: this.id('sit'),
      title: draft.title.trim(),
      description: draft.description.trim(),
      context: draft.context.trim(),
      learningObjective: draft.learningObjective.trim(),
      difficulty: draft.difficulty,
      category: draft.category,
      status: 'DRAFT',
      createdById: teacherId,
      resources: draft.resources?.trim() ?? '',
      mapEnvironment: draft.mapEnvironment,
      generalContextTitle: draft.generalContextTitle?.trim(),
      generalContextBody: draft.generalContextBody?.trim(),
      createdAt: now,
      updatedAt: now,
    };
    this.commit({ ...this.store(), situations: [situation, ...this.store().situations] });
    return situation;
  }

  updateSituation(situationId: string, draft: Partial<SituationDraft>): void {
    this.commit({
      ...this.store(),
      situations: this.store().situations.map((s) =>
        s.id === situationId
          ? {
              ...s,
              ...draft,
              title: draft.title?.trim() ?? s.title,
              description: draft.description?.trim() ?? s.description,
              context: draft.context?.trim() ?? s.context,
              learningObjective: draft.learningObjective?.trim() ?? s.learningObjective,
              resources: draft.resources?.trim() ?? s.resources,
              generalContextTitle: draft.generalContextTitle?.trim() ?? s.generalContextTitle,
              generalContextBody: draft.generalContextBody?.trim() ?? s.generalContextBody,
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    });
  }

  deleteSituation(situationId: string): boolean {
    const inUse = this.store().groupTasks.some((t) => t.situationId === situationId);
    if (inUse) return false;
    const scenarioIds = new Set(this.scenariosForSituation(situationId).map((s) => s.id));
    const questionIds = new Set(
      this.store().questions.filter((q) => scenarioIds.has(q.scenarioId)).map((q) => q.id),
    );
    this.commit({
      ...this.store(),
      situations: this.store().situations.filter((s) => s.id !== situationId),
      scenarios: this.store().scenarios.filter((s) => s.situationId !== situationId),
      questions: this.store().questions.filter((q) => !questionIds.has(q.id)),
      answerOptions: this.store().answerOptions.filter((o) => !questionIds.has(o.questionId)),
    });
    return true;
  }

  setSituationEnabled(situationId: string, enabled: boolean): void {
    this.updateSituationStatus(situationId, enabled ? 'PUBLISHED' : 'DRAFT');
  }

  updateScenario(scenarioId: string, draft: Partial<ScenarioDraft>): void {
    this.commit({
      ...this.store(),
      scenarios: this.store().scenarios.map((s) =>
        s.id === scenarioId
          ? {
              ...s,
              title: draft.title?.trim() ?? s.title,
              context: draft.context?.trim() ?? s.context,
              instructions: draft.instructions?.trim() ?? s.instructions,
              interactableKind: draft.interactableKind ?? s.interactableKind,
            }
          : s,
      ),
    });
  }

  deleteScenario(scenarioId: string): void {
    const questionIds = new Set(this.questionsForScenario(scenarioId).map((q) => q.id));
    this.commit({
      ...this.store(),
      scenarios: this.store().scenarios.filter((s) => s.id !== scenarioId),
      questions: this.store().questions.filter((q) => !questionIds.has(q.id)),
      answerOptions: this.store().answerOptions.filter((o) => !questionIds.has(o.questionId)),
    });
  }

  deleteQuestion(questionId: string): void {
    this.commit({
      ...this.store(),
      questions: this.store().questions.filter((q) => q.id !== questionId),
      answerOptions: this.store().answerOptions.filter((o) => o.questionId !== questionId),
    });
  }

  updateStudent(userId: string, name: string, email: string, code: string): void {
    const now = new Date().toISOString();
    this.commit({
      ...this.store(),
      users: this.store().users.map((u) =>
        u.id === userId ? { ...u, name: name.trim(), email: email.trim().toLowerCase(), updatedAt: now } : u,
      ),
      studentProfiles: this.store().studentProfiles.map((p) =>
        p.userId === userId ? { ...p, code: code.trim() || p.code } : p,
      ),
    });
  }

  teacherStats(teacherId: string) {
    const cases = this.situationsForTeacher(teacherId);
    const groups = this.groupsByTeacher(teacherId);
    const students = this.studentsByTeacher(teacherId);
    const groupIds = new Set(groups.map((g) => g.id));
    const tasks = this.store().groupTasks.filter((t) => groupIds.has(t.groupId));
    return {
      totalCases: cases.length,
      publishedCases: cases.filter((c) => c.status === 'PUBLISHED').length,
      draftCases: cases.filter((c) => c.status === 'DRAFT').length,
      groups: groups.length,
      students: students.length,
      tasks: tasks.length,
      activeCases: cases.filter((c) => c.status === 'PUBLISHED').length,
    };
  }

  /** Escenarios publicados del catalogo (pertenecen a situaciones publicadas). */
  catalogScenarios(): Scenario[] {
    const publishedIds = new Set(this.catalogSituations().map((situation) => situation.id));
    return this.store()
      .scenarios.filter((scenario) => publishedIds.has(scenario.situationId))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  /** Preguntas publicadas del catalogo (pertenecen a escenarios publicados). */
  catalogQuestions(): Question[] {
    const scenarioIds = new Set(this.catalogScenarios().map((scenario) => scenario.id));
    return this.store()
      .questions.filter((question) => scenarioIds.has(question.scenarioId))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  situationsBySuperAdmin(superAdminId: string): Situation[] {
    return this.store().situations.filter((situation) => situation.createdById === superAdminId);
  }

  createGroup(teacherId: string, name: string, description: string): void {
    const now = new Date().toISOString();
    const group: GameGroup = {
      id: this.id('grp'),
      name: name.trim(),
      description: description.trim(),
      teacherId,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    this.commit({ ...this.store(), groups: [group, ...this.store().groups] });
  }

  updateGroup(groupId: string, name: string, description: string, status: 'ACTIVE' | 'INACTIVE'): void {
    this.commit({
      ...this.store(),
      groups: this.store().groups.map((group) =>
        group.id === groupId
          ? { ...group, name: name.trim(), description: description.trim(), status, updatedAt: new Date().toISOString() }
          : group,
      ),
    });
  }

  createStudent(name: string, email: string, password: string, documentId: string): User {
    const doc = documentId.trim();
    if (!doc) {
      throw new Error('La tarjeta de identidad es obligatoria.');
    }
    const now = new Date().toISOString();
    const user: User = {
      id: this.id('usr'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    this.commit({
      ...this.store(),
      users: [user, ...this.store().users],
      studentProfiles: [
        {
          id: this.id('spr'),
          userId: user.id,
          code: doc,
          nickname: '',
          avatarId: DEFAULT_AVATAR_ID,
          onboardingCompleted: false,
          createdAt: now,
        },
        ...this.store().studentProfiles,
      ],
    });
    return user;
  }

  addStudentToGroup(groupId: string, studentId: string): void {
    if (this.store().groupStudents.some((membership) => membership.groupId === groupId && membership.studentId === studentId)) {
      return;
    }
    const membership: GroupStudent = { id: this.id('gst'), groupId, studentId, joinedAt: new Date().toISOString() };
    this.commit({ ...this.store(), groupStudents: [membership, ...this.store().groupStudents] });
  }

  removeStudentFromGroup(groupId: string, studentId: string): void {
    this.commit({
      ...this.store(),
      groupStudents: this.store().groupStudents.filter(
        (membership) => !(membership.groupId === groupId && membership.studentId === studentId),
      ),
    });
  }

  createSituation(
    superAdminId: string,
    title: string,
    description: string,
    context: string,
    learningObjective: string,
    difficulty: Difficulty,
  ): void {
    const now = new Date().toISOString();
    const situation: Situation = {
      id: this.id('sit'),
      title: title.trim(),
      description: description.trim(),
      context: context.trim(),
      learningObjective: learningObjective.trim(),
      difficulty,
      category: 'CLINICAL',
      status: 'DRAFT',
      createdById: superAdminId,
      createdAt: now,
      updatedAt: now,
    };
    this.commit({ ...this.store(), situations: [situation, ...this.store().situations] });
  }

  updateSituationStatus(situationId: string, status: SituationStatus): void {
    this.commit({
      ...this.store(),
      situations: this.store().situations.map((situation) =>
        situation.id === situationId ? { ...situation, status, updatedAt: new Date().toISOString() } : situation,
      ),
    });
  }

  createScenario(
    situationId: string,
    title: string,
    context: string,
    instructions: string,
    interactableKind?: Scenario['interactableKind'],
  ): void {
    const orderIndex = this.scenariosForSituation(situationId).length + 1;
    const scenario: Scenario = {
      id: this.id('sce'),
      situationId,
      title: title.trim(),
      context: context.trim(),
      instructions: instructions.trim(),
      orderIndex,
      interactableKind,
      createdAt: new Date().toISOString(),
    };
    this.commit({ ...this.store(), scenarios: [...this.store().scenarios, scenario] });
  }

  studentProfileFor(userId: string) {
    return this.store().studentProfiles.find((profile) => profile.userId === userId);
  }

  isNicknameAvailable(nickname: string, excludeUserId?: string): boolean {
    const normalized = nickname.trim().toLowerCase();
    if (normalized.length < 3) return false;
    return !this.store().studentProfiles.some(
      (p) =>
        p.nickname?.trim().toLowerCase() === normalized &&
        (!excludeUserId || p.userId !== excludeUserId),
    );
  }

  updateStudentGameProfile(
    userId: string,
    patch: {
      nickname?: string;
      characterName?: string;
      avatarId?: AvatarId;
      avatarLook?: AvatarLook;
      rpmAvatarUrl?: string;
      accessories?: AvatarAccessories;
      appearance?: AvatarAppearance;
      onboardingCompleted?: boolean;
    },
  ): boolean {
    const profile = this.studentProfileFor(userId);
    if (!profile) return false;
    if (patch.nickname !== undefined) {
      const nick = patch.nickname.trim();
      if (nick.length < 3 || !this.isNicknameAvailable(nick, userId)) return false;
    }
    const now = new Date().toISOString();
    this.commit({
      ...this.store(),
      studentProfiles: this.store().studentProfiles.map((p) =>
        p.userId === userId
          ? {
              ...p,
              ...patch,
              nickname: patch.nickname !== undefined ? patch.nickname.trim() : p.nickname,
              updatedAt: now,
            }
          : p,
      ),
    });
    return true;
  }

  deleteStudent(userId: string): void {
    this.setUserStatus(userId, 'INACTIVE');
  }

  createQuestion(scenarioId: string, draft: QuestionDraft): void {
    const cleanOptions = draft.options.map((option) => option.trim()).filter(Boolean);
    const minOptions = draft.questionType === 'OPEN' ? 1 : 2;
    if (cleanOptions.length < minOptions || draft.correctIndex < 0 || draft.correctIndex >= cleanOptions.length) {
      return;
    }
    const questionId = this.id('que');
    const orderIndex = this.questionsForScenario(scenarioId).length + 1;
    const question: Question = {
      id: questionId,
      scenarioId,
      statement: draft.statement.trim(),
      category: draft.category,
      questionType: draft.questionType ?? 'MULTIPLE_CHOICE',
      points: draft.points ?? 10,
      orderIndex,
      feedback: draft.feedback.trim(),
      createdAt: new Date().toISOString(),
    };
    const options = cleanOptions.map<AnswerOption>((text, index) => ({
      id: this.id('opt'),
      questionId,
      text,
      isCorrect: index === draft.correctIndex,
      orderIndex: index + 1,
    }));
    this.commit({
      ...this.store(),
      questions: [...this.store().questions, question],
      answerOptions: [...this.store().answerOptions, ...options],
    });
  }

  /** El maestro agenda simulación: valida tiempos, autorizados y credenciales (REQ-04). */
  scheduleTaskToGroup(draft: TaskDraft): ScheduleTaskResult {
    const maxDuration = draft.maxDurationMinutes ?? 120;
    const estimated = draft.estimatedMinutes ?? 90;
    if (maxDuration > estimated) {
      return {
        ok: false,
        error:
          'El tiempo máximo no puede superar el tiempo estimado del caso. Ajusta los minutos para que sean coherentes.',
      };
    }

    const situation = this.store().situations.find((item) => item.id === draft.situationId);
    if (!situation || situation.status !== 'PUBLISHED') {
      return { ok: false, error: 'El caso debe estar publicado y habilitado para agendar.' };
    }

    const scenarioIds = [...new Set(draft.scenarioIds)].filter((id) => {
      const scenario = this.store().scenarios.find((item) => item.id === id);
      return scenario?.situationId === draft.situationId;
    });
    const questionIds = [...new Set(draft.questionIds)].filter((id) => {
      const question = this.store().questions.find((item) => item.id === id);
      if (!question) return false;
      const scenario = this.store().scenarios.find((item) => item.id === question.scenarioId);
      return scenario?.situationId === draft.situationId && scenarioIds.includes(question.scenarioId);
    });

    if (!scenarioIds.length || !questionIds.length) {
      return { ok: false, error: 'Selecciona al menos un escenario y una pregunta.' };
    }

    const group = this.store().groups.find((g) => g.id === draft.groupId);
    if (!group) {
      return { ok: false, error: 'Grupo no encontrado.' };
    }

    const authorizedIds = new Set<string>();

    for (const invitee of draft.invitees ?? []) {
      const email = invitee.email.trim().toLowerCase();
      const name = invitee.name.trim();
      if (!email || !name) continue;
      const documentId = invitee.documentId?.trim() ?? '';
      if (!documentId) continue;
      let user = this.store().users.find((u) => u.email.toLowerCase() === email && u.role === 'STUDENT');
      if (!user) {
        user = this.createStudent(name, email, this.generateAuthCode(), documentId);
      } else {
        this.updateStudent(user.id, name, email, documentId);
      }
      if (!this.store().groupStudents.some((m) => m.groupId === draft.groupId && m.studentId === user!.id)) {
        this.addStudentToGroup(draft.groupId, user.id);
      }
      authorizedIds.add(user.id);
    }

    for (const studentId of draft.authorizedStudentIds ?? []) {
      authorizedIds.add(studentId);
      if (!this.store().groupStudents.some((m) => m.groupId === draft.groupId && m.studentId === studentId)) {
        this.addStudentToGroup(draft.groupId, studentId);
      }
    }

    if (!authorizedIds.size) {
      return { ok: false, error: 'Selecciona o registra al menos un estudiante autorizado.' };
    }

    const now = new Date();
    const startAt = draft.scheduledStartAt ?? now.toISOString();
    const endAt = draft.scheduledEndAt ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      return { ok: false, error: 'La fecha de fin debe ser posterior al inicio.' };
    }

    const task: GroupTask = {
      id: this.id('tsk'),
      groupId: draft.groupId,
      situationId: draft.situationId,
      scenarioIds,
      questionIds,
      assignedAt: new Date().toISOString(),
    };

    const session: TaskSession = {
      id: this.id('ses'),
      taskId: task.id,
      groupId: task.groupId,
      situationId: task.situationId,
      teacherId: group.teacherId,
      academicSpace: draft.academicSpace?.trim() || group.name,
      location: draft.location?.trim() || 'Campus virtual MIND-SPHERE',
      scheduledStartAt: startAt,
      scheduledEndAt: endAt,
      maxDurationMinutes: maxDuration,
      estimatedMinutes: estimated,
      customMessage: draft.customMessage?.trim() || undefined,
      authorizedStudentIds: [...authorizedIds],
      status: 'NOT_STARTED',
      allowRetries: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const authorizations: SessionAuthorization[] = [...authorizedIds].map((studentId) => ({
      id: this.id('sau'),
      sessionId: session.id,
      taskId: task.id,
      studentId,
      authCode: this.generateAuthCode(),
      createdAt: new Date().toISOString(),
    }));

    this.commit({
      ...this.store(),
      groupTasks: [task, ...this.store().groupTasks],
      taskSessions: [session, ...(this.store().taskSessions ?? [])],
      sessionAuthorizations: [...authorizations, ...(this.store().sessionAuthorizations ?? [])],
    });

    return { ok: true, task, session, authorizations };
  }

  /** @deprecated Use scheduleTaskToGroup */
  assignTaskToGroup(draft: TaskDraft): GroupTask | undefined {
    const result = this.scheduleTaskToGroup(draft);
    return result.ok ? result.task : undefined;
  }

  tasksForGroup(groupId: string): GroupTask[] {
    return this.store()
      .groupTasks.filter((task) => task.groupId === groupId)
      .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));
  }

  taskById(taskId: string): GroupTask | undefined {
    return this.store().groupTasks.find((task) => task.id === taskId);
  }

  situationForTask(task: GroupTask): Situation | undefined {
    return this.store().situations.find((situation) => situation.id === task.situationId);
  }

  scenariosForTask(task: GroupTask): Scenario[] {
    const selected = new Set(task.scenarioIds);
    return this.store()
      .scenarios.filter((scenario) => selected.has(scenario.id))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  questionsForTask(task: GroupTask, scenarioId?: string): Question[] {
    const selected = new Set(task.questionIds);
    return this.store()
      .questions.filter((question) => {
        if (!selected.has(question.id)) {
          return false;
        }
        return scenarioId ? question.scenarioId === scenarioId : true;
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  tasksForStudentInGroup(studentId: string, groupId: string): GroupTask[] {
    const belongsToGroup = this.store().groupStudents.some(
      (membership) => membership.groupId === groupId && membership.studentId === studentId,
    );
    if (!belongsToGroup) return [];
    return this.tasksForGroup(groupId).filter((task) => {
      const session = this.sessionForTask(task.id);
      if (!session?.authorizedStudentIds?.length) return true;
      return session.authorizedStudentIds.includes(studentId);
    });
  }

  authorizationForStudentTask(studentId: string, taskId: string): SessionAuthorization | undefined {
    return (this.store().sessionAuthorizations ?? []).find(
      (a) => a.studentId === studentId && a.taskId === taskId && !a.blockedAt,
    );
  }

  findAuthorizationByEmailAndCode(email: string, code: string): SessionAuthorization | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim().toUpperCase();
    const user = this.store().users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.role === 'STUDENT' && u.status === 'ACTIVE',
    );
    if (!user) return undefined;
    return (this.store().sessionAuthorizations ?? []).find(
      (a) => a.studentId === user.id && a.authCode.toUpperCase() === normalizedCode,
    );
  }

  permanentlyBlockStudentAccess(studentId: string, taskId: string): void {
    const now = new Date().toISOString();
    const sessionAuthorizations = (this.store().sessionAuthorizations ?? []).map((a) =>
      a.studentId === studentId && a.taskId === taskId ? { ...a, blockedAt: now } : a,
    );
    this.commit({ ...this.store(), sessionAuthorizations });
  }

  isStudentBlockedForTask(studentId: string, taskId: string): boolean {
    return (this.store().sessionAuthorizations ?? []).some(
      (a) => a.studentId === studentId && a.taskId === taskId && Boolean(a.blockedAt),
    );
  }

  userById(userId: string): User | undefined {
    return this.store().users.find((u) => u.id === userId);
  }

  generateAuthCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 8; i += 1) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    return `MS-${suffix}`;
  }

  groupsForStudent(studentId: string): GameGroup[] {
    const groupIds = new Set(
      this.store()
        .groupStudents.filter((membership) => membership.studentId === studentId)
        .map((membership) => membership.groupId),
    );
    return this.store().groups.filter((group) => groupIds.has(group.id) && group.status === 'ACTIVE');
  }

  situationsForGroup(groupId: string): Situation[] {
    const taskSituationIds = new Set(this.tasksForGroup(groupId).map((task) => task.situationId));
    return this.store().situations.filter(
      (situation) => taskSituationIds.has(situation.id) && situation.status === 'PUBLISHED',
    );
  }

  scenariosForSituation(situationId: string): Scenario[] {
    return this.store()
      .scenarios.filter((scenario) => scenario.situationId === situationId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  questionsForScenario(scenarioId: string): Question[] {
    return this.store()
      .questions.filter((question) => question.scenarioId === scenarioId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  optionsForQuestion(questionId: string): AnswerOption[] {
    return this.store()
      .answerOptions.filter((option) => option.questionId === questionId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  answerQuestion(studentId: string, taskId: string, questionId: string, selectedOptionId: string): void {
    const task = this.taskById(taskId);
    const option = this.store().answerOptions.find((item) => item.id === selectedOptionId);
    const question = this.store().questions.find((item) => item.id === questionId);
    if (!task || !option || !question || !task.questionIds.includes(questionId)) {
      return;
    }
    const answer: StudentAnswer = {
      id: this.id('ans'),
      studentId,
      questionId,
      selectedOptionId,
      isCorrect: option.isCorrect,
      answeredAt: new Date().toISOString(),
    };
    const answers = [
      answer,
      ...this.store().studentAnswers.filter((item) => !(item.studentId === studentId && item.questionId === questionId)),
    ];
    this.commit({ ...this.store(), studentAnswers: answers });
    this.recalculateProgress(studentId, task);
  }

  answerForQuestion(studentId: string, questionId: string): StudentAnswer | undefined {
    return this.store().studentAnswers.find((answer) => answer.studentId === studentId && answer.questionId === questionId);
  }

  /** Borra respuestas y progreso de una tarea para volver a jugar el simulador desde cero. */
  resetStudentTaskProgress(studentId: string, taskId: string): void {
    const task = this.taskById(taskId);
    if (!task) return;
    const questionIds = new Set(task.questionIds);
    const studentAnswers = this.store().studentAnswers.filter(
      (a) => !(a.studentId === studentId && questionIds.has(a.questionId)),
    );
    const studentProgress = this.store().studentProgress.filter(
      (p) => !(p.studentId === studentId && p.taskId === taskId),
    );
    const intentosEstudiante = (this.store().intentosEstudiante ?? []).filter(
      (i) => !(i.studentId === studentId && i.taskId === taskId),
    );
    this.commit({ ...this.store(), studentAnswers, studentProgress, intentosEstudiante });
  }

  /** Reinicia la misión demo del estudiante (Caso 1 · campus). */
  resetDemoStudentProgress(): void {
    this.resetStudentTaskProgress(DEMO_STUDENT_ID, DEMO_TASK_ID);
  }

  progressFor(studentId: string, taskId: string): StudentProgress {
    return (
      this.store().studentProgress.find((progress) => progress.studentId === studentId && progress.taskId === taskId) ?? {
        id: this.id('tmp'),
        studentId,
        taskId,
        progressPercentage: 0,
        completed: false,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  globalRubric(): RubricaEvaluacion | undefined {
    return (this.store().rubricas ?? []).find((r) => r.id === GLOBAL_RUBRIC_ID);
  }

  saveGlobalRubric(rubric: RubricaEvaluacion): void {
    const rest = (this.store().rubricas ?? []).filter((r) => r.id !== GLOBAL_RUBRIC_ID);
    this.commit({ ...this.store(), rubricas: [rubric, ...rest] });
  }

  deleteGlobalRubric(): void {
    const rubricas = (this.store().rubricas ?? []).filter((r) => r.id !== GLOBAL_RUBRIC_ID);
    this.commit({ ...this.store(), rubricas });
  }

  saveStudentAttempt(intento: IntentoEstudiante): void {
    const rest = (this.store().intentosEstudiante ?? []).filter(
      (i) => !(i.studentId === intento.studentId && i.taskId === intento.taskId),
    );
    const progress = this.progressFor(intento.studentId, intento.taskId);
    const updatedProgress: StudentProgress = {
      ...progress,
      completed: true,
      progressPercentage: 100,
      notaFinal: intento.notaFinal,
      respuestasCorrectas: intento.respuestasCorrectas,
      respuestasIncorrectas: intento.respuestasIncorrectas,
      porcentajeAcierto: intento.porcentaje,
      intentoId: intento.id,
      completedAt: intento.fechaFinalizacion,
      updatedAt: intento.fechaFinalizacion,
    };
    this.commit({
      ...this.store(),
      intentosEstudiante: [intento, ...rest],
      studentProgress: [
        updatedProgress,
        ...this.store().studentProgress.filter(
          (p) => !(p.studentId === intento.studentId && p.taskId === intento.taskId),
        ),
      ],
    });
  }

  attemptForStudentTask(studentId: string, taskId: string): IntentoEstudiante | undefined {
    return (this.store().intentosEstudiante ?? []).find(
      (i) => i.studentId === studentId && i.taskId === taskId,
    );
  }

  answersForStudentTask(studentId: string, task: GroupTask): StudentAnswer[] {
    const questionIds = new Set(task.questionIds);
    return this.store().studentAnswers.filter(
      (a) => a.studentId === studentId && questionIds.has(a.questionId),
    );
  }

  sessionForTask(taskId: string): TaskSession | undefined {
    return (this.store().taskSessions ?? []).find((s) => s.taskId === taskId);
  }

  upsertTaskSession(session: TaskSession): void {
    const rest = (this.store().taskSessions ?? []).filter((s) => s.taskId !== session.taskId);
    this.commit({ ...this.store(), taskSessions: [session, ...rest] });
  }

  startTaskSession(taskId: string): TaskSession | undefined {
    const session = this.sessionForTask(taskId);
    if (!session || session.status === 'FINISHED') return undefined;
    const now = new Date().toISOString();
    const updated: TaskSession = {
      ...session,
      status: 'IN_PROGRESS',
      startedAt: session.startedAt ?? now,
      updatedAt: now,
    };
    this.upsertTaskSession(updated);
    return updated;
  }

  finishTaskSession(taskId: string): TaskSession | undefined {
    const session = this.sessionForTask(taskId);
    if (!session) return undefined;
    const now = new Date().toISOString();
    const updated: TaskSession = { ...session, status: 'FINISHED', finishedAt: now, updatedAt: now };
    this.upsertTaskSession(updated);
    this.processPartialGradesForTask(taskId);
    return updated;
  }

  updateTaskSession(
    taskId: string,
    patch: Partial<
      Pick<
        TaskSession,
        | 'scheduledStartAt'
        | 'scheduledEndAt'
        | 'maxDurationMinutes'
        | 'estimatedMinutes'
        | 'customMessage'
        | 'allowRetries'
      >
    >,
  ): TaskSession | undefined {
    const session = this.sessionForTask(taskId);
    if (!session) return undefined;
    const updated: TaskSession = { ...session, ...patch, updatedAt: new Date().toISOString() };
    this.upsertTaskSession(updated);
    return updated;
  }

  setAttemptTeacherFeedback(intentoId: string, teacherId: string, comment: string): boolean {
    const intentos = this.store().intentosEstudiante ?? [];
    const idx = intentos.findIndex((i) => i.id === intentoId);
    if (idx < 0) return false;
    const now = new Date().toISOString();
    const updated = [...intentos];
    updated[idx] = {
      ...updated[idx],
      comentarioDocente: comment.trim(),
      comentarioDocenteAt: now,
    };
    this.commit({ ...this.store(), intentosEstudiante: updated });
    return true;
  }

  queueNotification(params: {
    type: NotificationType;
    recipientEmail: string;
    subject: string;
    body: string;
  }): NotificationRecord {
    const record: NotificationRecord = {
      id: this.id('ntf'),
      type: params.type,
      recipientEmail: params.recipientEmail,
      subject: params.subject,
      body: params.body,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.commit({
      ...this.store(),
      notifications: [record, ...(this.store().notifications ?? [])],
    });
    return record;
  }

  notificationsForEmail(email: string): NotificationRecord[] {
    const normalized = email.trim().toLowerCase();
    return (this.store().notifications ?? [])
      .filter((n) => n.recipientEmail.toLowerCase() === normalized)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  unreadNotificationCount(email: string): number {
    return this.notificationsForEmail(email).filter((n) => !n.readAt).length;
  }

  markNotificationSent(id: string, sentAt?: string): void {
    const notifications = (this.store().notifications ?? []).map((n) =>
      n.id === id
        ? { ...n, status: 'SENT' as const, sentAt: sentAt ?? new Date().toISOString(), deliveryError: undefined }
        : n,
    );
    this.commit({ ...this.store(), notifications });
  }

  markNotificationFailed(id: string, deliveryError: string): void {
    const notifications = (this.store().notifications ?? []).map((n) =>
      n.id === id ? { ...n, status: 'FAILED' as const, deliveryError } : n,
    );
    this.commit({ ...this.store(), notifications });
  }

  markNotificationRead(id: string): void {
    const notifications = (this.store().notifications ?? []).map((n) =>
      n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n,
    );
    this.commit({ ...this.store(), notifications });
  }

  /** REQ-14 — finaliza sesiones cuya fecha límite pasó hace más de 24 h. */
  processExpiredSessions(): number {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    let closed = 0;
    const sessions = (this.store().taskSessions ?? []).map((session) => {
      if (session.status === 'FINISHED') return session;
      const end = new Date(session.scheduledEndAt).getTime();
      if (now > end + dayMs) {
        closed++;
        return {
          ...session,
          status: 'FINISHED' as TaskSessionStatus,
          finishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return session;
    });
    if (closed) {
      this.commit({ ...this.store(), taskSessions: sessions });
    }
    return closed;
  }

  /** REQ-10 — nota proporcional al avance si la sesión cierra sin completar. */
  private processPartialGradesForTask(taskId: string): void {
    const task = this.taskById(taskId);
    if (!task) return;
    const studentIds = this.store()
      .groupStudents.filter((m) => m.groupId === task.groupId)
      .map((m) => m.studentId);
    for (const studentId of studentIds) {
      const progress = this.progressFor(studentId, taskId);
      if (progress.completed || progress.notaFinal != null) continue;
      const answers = this.answersForStudentTask(studentId, task);
      if (!answers.length) {
        this.commit({
          ...this.store(),
          studentProgress: [
            {
              ...progress,
              notaFinal: 1,
              progressPercentage: 0,
              updatedAt: new Date().toISOString(),
            },
            ...this.store().studentProgress.filter(
              (p) => !(p.studentId === studentId && p.taskId === taskId),
            ),
          ],
        });
        continue;
      }
      const correct = answers.filter((a) => a.isCorrect).length;
      const total = task.questionIds.length;
      const nota = total ? Math.round((1 + (correct / total) * 4) * 10) / 10 : 1;
      this.commit({
        ...this.store(),
        studentProgress: [
          {
            ...progress,
            notaFinal: nota,
            respuestasCorrectas: correct,
            respuestasIncorrectas: answers.length - correct,
            porcentajeAcierto: total ? Math.round((correct / total) * 100) : 0,
            updatedAt: new Date().toISOString(),
          },
          ...this.store().studentProgress.filter(
            (p) => !(p.studentId === studentId && p.taskId === taskId),
          ),
        ],
      });
    }
  }

  resultRowsForGroup(groupId: string): Array<{
    student: User;
    task: GroupTask;
    situation: Situation;
    progress: StudentProgress;
    correct: number;
    incorrect: number;
    pending: number;
    notaFinal?: number;
    intentoId?: string;
  }> {
    const studentIds = this.store()
      .groupStudents.filter((membership) => membership.groupId === groupId)
      .map((membership) => membership.studentId);
    const tasks = this.tasksForGroup(groupId);
    return studentIds.flatMap((studentId) => {
      const student = this.store().users.find((user) => user.id === studentId);
      if (!student) {
        return [];
      }
      return tasks.flatMap((task) => {
        const situation = this.situationForTask(task);
        if (!situation) {
          return [];
        }
        const questions = this.questionsForTask(task);
        const answers = questions
          .map((question) => this.answerForQuestion(studentId, question.id))
          .filter((answer): answer is StudentAnswer => Boolean(answer));
        return [
          {
            student,
            task,
            situation,
            progress: this.progressFor(studentId, task.id),
            correct: answers.filter((answer) => answer.isCorrect).length,
            incorrect: answers.filter((answer) => !answer.isCorrect).length,
            pending: Math.max(questions.length - answers.length, 0),
            notaFinal: this.progressFor(studentId, task.id).notaFinal,
            intentoId: this.progressFor(studentId, task.id).intentoId,
          },
        ];
      });
    });
  }

  questionsForSituation(situationId: string): Question[] {
    const scenarioIds = new Set(this.scenariosForSituation(situationId).map((scenario) => scenario.id));
    return this.store()
      .questions.filter((question) => scenarioIds.has(question.scenarioId))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  private recalculateProgress(studentId: string, task: GroupTask): void {
    const questions = this.questionsForTask(task);
    const answered = questions.filter((question) => this.answerForQuestion(studentId, question.id)).length;
    const percentage = questions.length ? Math.round((answered / questions.length) * 100) : 0;
    const now = new Date().toISOString();
    const existing = this.store().studentProgress.find(
      (progress) => progress.studentId === studentId && progress.taskId === task.id,
    );
    const progress: StudentProgress = {
      id: existing?.id ?? this.id('prg'),
      studentId,
      taskId: task.id,
      progressPercentage: percentage,
      completed: percentage === 100,
      updatedAt: now,
    };
    this.commit({
      ...this.store(),
      studentProgress: [progress, ...this.store().studentProgress.filter((item) => item.id !== progress.id)],
    });
  }

  private commit(store: AcademyStore): void {
    this.state.set(store);
    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
      } catch (error) {
        console.warn('No se pudo guardar el store en localStorage.', error);
      }
      void this.saveDockerStore(store);
    }
  }

  private id(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private loadInitialStore(): AcademyStore {
    if (!this.isBrowser()) {
      return this.seedStore();
    }

    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      return this.normalizeStore(JSON.parse(saved) as AcademyStore);
    }

    return this.seedStore();
  }

  private async loadDockerStore(): Promise<void> {
    if (!this.isBrowser()) {
      return;
    }

    try {
      const response = await fetch(STORE_API_URL, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        throw new Error(`Store API responded ${response.status}`);
      }

      const remoteStore = (await response.json()) as AcademyStore | null;
      if (remoteStore) {
        this.state.set(this.normalizeStore(remoteStore));
        localStorage.removeItem(STORE_KEY);
        return;
      }

      await this.saveDockerStore(this.store());
      localStorage.removeItem(STORE_KEY);
    } catch (error) {
      console.warn('No se pudo cargar el store desde Docker. Se usara el estado inicial en memoria.', error);
    }
  }

  private async saveDockerStore(store: AcademyStore): Promise<void> {
    try {
      const response = await fetch(STORE_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store),
      });
      if (!response.ok) {
        throw new Error(`Store API responded ${response.status}`);
      }
    } catch (error) {
      console.warn('No se pudo guardar el store en Docker.', error);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private normalizeStore(store: AcademyStore): AcademyStore {
    const scenarioPatches = DEMO_SCENARIO_CONTEXT;

    return {
      ...store,
      situations: store.situations.map((s) => {
        const base = {
          ...s,
          category: s.category ?? 'CLINICAL',
          resources: s.resources ?? '',
        };
        if (s.id === 'sit-demo') {
          return { ...base, ...DEMO_CASE_INTRO };
        }
        return base;
      }),
      scenarios: store.scenarios.map((s) => {
        const patch = scenarioPatches[s.id];
        return patch
          ? {
              ...s,
              context: patch.context,
              contextPanelTitle: patch.contextPanelTitle,
              contextPanelBody: patch.contextPanelBody,
            }
          : s;
      }),
      questions: store.questions.map((q) => ({
        ...q,
        questionType: q.questionType ?? 'MULTIPLE_CHOICE',
        points: q.points ?? 10,
      })),
      teacherProfiles: store.teacherProfiles.map((profile) => ({
        ...profile,
        canCreateCases: profile.canCreateCases ?? false,
        avatarId: normalizeTeacherAvatarId(profile.avatarId),
        characterName: profile.characterName ?? '',
        avatarConfigured: profile.avatarConfigured ?? false,
      })),
      studentProfiles: store.studentProfiles.map((p) => ({
        ...p,
        nickname: p.nickname ?? '',
        avatarId: normalizeAvatarId(p.avatarId),
        characterName: p.characterName ?? '',
        avatarLook: p.avatarLook
          ? normalizeAvatarLook(p.avatarLook)
          : migrateLegacyLook({ appearance: p.appearance, accessories: p.accessories }),
        rpmAvatarUrl: p.rpmAvatarUrl?.trim() || undefined,
        accessories: normalizeAccessories(p.accessories),
        appearance: normalizeAppearance(p.appearance),
        onboardingCompleted: p.onboardingCompleted ?? false,
      })),
      platformSettings: store.platformSettings ?? {
        emergencyLockout: false,
        updatedAt: new Date().toISOString(),
      },
      rubricas: store.rubricas ?? [],
      intentosEstudiante: store.intentosEstudiante ?? [],
      taskSessions: this.normalizeTaskSessions(store),
      sessionAuthorizations: this.normalizeSessionAuthorizations(store),
      notifications: store.notifications ?? [],
    };
  }

  private normalizeTaskSessions(store: AcademyStore): TaskSession[] {
    const existing = store.taskSessions ?? [];
    if (existing.length) return existing;
    const now = new Date().toISOString();
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    return store.groupTasks.map((task) => {
      const group = store.groups.find((g) => g.id === task.groupId);
      const isDemo = task.id === DEMO_TASK_ID;
      return {
        id: `ses-mig-${task.id}`,
        taskId: task.id,
        groupId: task.groupId,
        situationId: task.situationId,
        teacherId: group?.teacherId ?? '',
        scheduledStartAt: task.assignedAt,
        scheduledEndAt: end,
        maxDurationMinutes: 120,
        estimatedMinutes: 90,
        status: isDemo ? 'IN_PROGRESS' : 'NOT_STARTED',
        startedAt: isDemo ? task.assignedAt : undefined,
        allowRetries: false,
        createdAt: now,
        updatedAt: now,
      };
    });
  }

  private normalizeSessionAuthorizations(store: AcademyStore): SessionAuthorization[] {
    const existing = store.sessionAuthorizations ?? [];
    if (existing.length) return existing;
    const now = new Date().toISOString();
    const authorizations: SessionAuthorization[] = [];
    for (const session of store.taskSessions ?? []) {
      const studentIds = session.authorizedStudentIds?.length
        ? session.authorizedStudentIds
        : store.groupStudents.filter((m) => m.groupId === session.groupId).map((m) => m.studentId);
      for (const studentId of studentIds) {
        const isDemo = session.taskId === DEMO_TASK_ID && studentId === DEMO_STUDENT_ID;
        authorizations.push({
          id: `sau-mig-${session.id}-${studentId}`,
          sessionId: session.id,
          taskId: session.taskId,
          studentId,
          authCode: isDemo ? 'MS-DEMO001' : this.generateAuthCode(),
          createdAt: now,
        });
      }
    }
    return authorizations;
  }

  private seedStore(): AcademyStore {
    const now = new Date().toISOString();
    const superAdmin: User = {
      id: 'usr-superadmin-demo',
      name: 'Superadmin Demo',
      email: 'superadmin@demo.edu',
      password: 'demo123',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    const teacher: User = {
      id: 'usr-teacher-demo',
      name: 'Maestro Demo',
      email: 'maestro@demo.edu',
      password: 'demo123',
      role: 'TEACHER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    const student: User = {
      id: 'usr-student-demo',
      name: 'Estudiante Demo',
      email: 'estudiante@demo.edu',
      password: 'demo123',
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    const group: GameGroup = {
      id: 'grp-demo',
      name: 'Grupo PAP y rutas de atencion',
      description: 'Modulo inicial para practicar decisiones de respuesta institucional desde un enfoque academico.',
      teacherId: teacher.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    const situation: Situation = {
      id: 'sit-demo',
      title: 'Caso 1: Violencia familiar y tentativa de feminicidio',
      description:
        'Son las 11 de la noche en un barrio con altas condiciones de vulnerabilidad: pobreza, violencias urbanas, robos, expendio de drogas, presencia de grupos armados ilegales y riñas callejeras entre vecinos.',
      context:
        'Un hombre de aproximadamente 28 años entra a su domicilio, donde reside con su actual pareja de 22 años. Ella tiene una hija de 3 años. Ese mismo día hubo un altercado verbal con maltrato psicológico y chantaje emocional. En la noche, el hombre saca una navaja, hiere a la menor causándole la muerte inmediata, y luego hiere múltiples veces a la mujer, dejándola gravemente herida.',
      ...DEMO_CASE_INTRO,
      learningObjective:
        'Aplicar primeros auxilios psicológicos, activar rutas interdisciplinarias y tomar decisiones éticas ante violencia de género y riesgo de feminicidio.',
      difficulty: 'INTERMEDIATE',
      category: 'CRISIS',
      status: 'PUBLISHED',
      createdById: superAdmin.id,
      mapEnvironment: 'attention-routes',
      createdAt: now,
      updatedAt: now,
    };
    const hospitalPatch = DEMO_SCENARIO_CONTEXT['sce-hospital'];
    const comisariaPatch = DEMO_SCENARIO_CONTEXT['sce-comisaria'];
    const hospital: Scenario = {
      id: 'sce-hospital',
      situationId: situation.id,
      title: 'Atención en Hospital (Urgencia Vital y Crisis)',
      context: hospitalPatch.context,
      contextPanelTitle: hospitalPatch.contextPanelTitle,
      contextPanelBody: hospitalPatch.contextPanelBody,
      instructions: 'Responde las preguntas sobre intervención inmediata, marco normativo y protocolos clínicos.',
      orderIndex: 1,
      createdAt: now,
    };
    const comisaria: Scenario = {
      id: 'sce-comisaria',
      situationId: situation.id,
      title: 'Comisaría de Familia (Restablecimiento de Derechos)',
      context: comisariaPatch.context,
      contextPanelTitle: comisariaPatch.contextPanelTitle,
      contextPanelBody: comisariaPatch.contextPanelBody,
      instructions: 'Responde desde un enfoque de derechos, seguridad y no revictimización.',
      orderIndex: 2,
      createdAt: now,
    };
    const questions: Question[] = [
      {
        id: 'que-hospital-1',
        scenarioId: hospital.id,
        statement: '¿En qué centrar la intervención inmediata?',
        category: 'TECHNICAL',
        questionType: 'MULTIPLE_CHOICE',
        points: 10,
        orderIndex: 1,
        feedback:
          'La prioridad es contención emocional, acompañamiento en el duelo inicial y estabilización de la crisis mediante Primeros Auxilios Psicológicos (PAP).',
        createdAt: now,
      },
      {
        id: 'que-hospital-2',
        scenarioId: hospital.id,
        statement: '¿Qué marco normativo y técnico debe seguir?',
        category: 'TECHNICAL',
        questionType: 'MULTIPLE_CHOICE',
        points: 10,
        orderIndex: 2,
        feedback:
          'La Resolución 459 de 2012 regula la atención en salud; la Ley 1257 de 2008 aborda la violencia contra la mujer.',
        createdAt: now,
      },
      {
        id: 'que-hospital-3',
        scenarioId: hospital.id,
        statement: '¿Qué se debe hacer y qué se debe evitar?',
        category: 'PSYCHOSOCIAL',
        questionType: 'MULTIPLE_CHOICE',
        points: 15,
        orderIndex: 3,
        feedback:
          'Se requiere PAP para la familia, escucha activa a la víctima, protocolo EPICEE/SPIKES para la noticia del fallecimiento, evaluación psicosocial y manejo interdisciplinar.',
        createdAt: now,
      },
      {
        id: 'que-comisaria-1',
        scenarioId: comisaria.id,
        statement: '¿Cuál es la prioridad en la asesoría psicosocial?',
        category: 'PSYCHOSOCIAL',
        questionType: 'MULTIPLE_CHOICE',
        points: 10,
        orderIndex: 1,
        feedback:
          'La valoración del riesgo de feminicidio, medidas de protección y asesoría sobre derechos económicos y de justicia son prioritarias.',
        createdAt: now,
      },
      {
        id: 'que-comisaria-2',
        scenarioId: comisaria.id,
        statement: '¿Qué marco normativo y técnico debe seguir?',
        category: 'TECHNICAL',
        questionType: 'MULTIPLE_CHOICE',
        points: 10,
        orderIndex: 2,
        feedback:
          'Ley 2126 de 2021 (Comisarías de Familia), Ley 1098 de 2006 (Código de Infancia) y Ley 1257 de 2008 (violencia contra la mujer).',
        createdAt: now,
      },
      {
        id: 'que-comisaria-3',
        scenarioId: comisaria.id,
        statement: '¿Qué se debe hacer y qué se debe evitar?',
        category: 'PSYCHOSOCIAL',
        questionType: 'MULTIPLE_CHOICE',
        points: 15,
        orderIndex: 3,
        feedback:
          'Valoración psicológica de la víctima y personas dependientes, nivel de riesgo, valoración de feminicidio y activación de rutas de derivación.',
        createdAt: now,
      },
    ];
    const answerOptions: AnswerOption[] = [
      {
        id: 'opt-hospital-1-a',
        questionId: 'que-hospital-1',
        text: 'Notificar a la madre y la familia sobre la muerte de la niña de inmediato',
        isCorrect: false,
        orderIndex: 1,
      },
      {
        id: 'opt-hospital-1-b',
        questionId: 'que-hospital-1',
        text: 'Contención emocional a la familia, acompañamiento en el duelo inicial y estabilización de la crisis (PAP)',
        isCorrect: true,
        orderIndex: 2,
      },
      {
        id: 'opt-hospital-1-c',
        questionId: 'que-hospital-1',
        text: 'Interrogar a la víctima herida para obtener detalles del agresor antes de que entre a cirugía',
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 'opt-hospital-1-d',
        questionId: 'que-hospital-1',
        text: 'Trasladar a la víctima herida a cirugía de urgencia antes de continuar con la atención a la familia',
        isCorrect: false,
        orderIndex: 4,
      },
      {
        id: 'opt-hospital-2-a',
        questionId: 'que-hospital-2',
        text: 'Resolución 459 de 2012',
        isCorrect: false,
        orderIndex: 1,
      },
      {
        id: 'opt-hospital-2-b',
        questionId: 'que-hospital-2',
        text: 'Resolución 459 de 2012 y Ley 1257 de 2008',
        isCorrect: true,
        orderIndex: 2,
      },
      {
        id: 'opt-hospital-2-c',
        questionId: 'que-hospital-2',
        text: 'Resolución 459 de 2012 y Ley 1448 de 2011',
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 'opt-hospital-2-d',
        questionId: 'que-hospital-2',
        text: 'Solo Ley 1257 de 2008, sin aplicar resoluciones de violencia de género',
        isCorrect: false,
        orderIndex: 4,
      },
      {
        id: 'opt-hospital-3-a',
        questionId: 'que-hospital-3',
        text: 'Escucha activa sin juicios, intervenir disonancia cognitiva, preguntar antecedentes y activar ruta clínica',
        isCorrect: false,
        orderIndex: 1,
      },
      {
        id: 'opt-hospital-3-b',
        questionId: 'que-hospital-3',
        text: 'PAP para la familia, escucha activa a la víctima, protocolo EPICEE/SPIKES para noticia del fallecimiento',
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 'opt-hospital-3-c',
        questionId: 'que-hospital-3',
        text: 'PAP, escucha activa, EPICEE/SPIKES, preguntar antecedentes de la relación y manejo interdisciplinar',
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 'opt-hospital-3-d',
        questionId: 'que-hospital-3',
        text: 'PAP, escucha activa, EPICEE/SPIKES, evaluación psicosocial familiar y manejo interdisciplinar',
        isCorrect: true,
        orderIndex: 4,
      },
      {
        id: 'opt-comisaria-1-a',
        questionId: 'que-comisaria-1',
        text: 'Instar a la mujer para que escuche al agresor en pro de la unión familiar y el perdón',
        isCorrect: false,
        orderIndex: 1,
      },
      {
        id: 'opt-comisaria-1-b',
        questionId: 'que-comisaria-1',
        text: 'Valoración del riesgo de feminicidio, medidas de protección y asesoría sobre derechos',
        isCorrect: true,
        orderIndex: 2,
      },
      {
        id: 'opt-comisaria-1-c',
        questionId: 'que-comisaria-1',
        text: 'Realizar psicoterapia para encontrar patrones de infancia en la elección de pareja',
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 'opt-comisaria-2-a',
        questionId: 'que-comisaria-2',
        text: 'Ley 2126 de 2021, Ley 1098 de 2006, Ley 1257 de 2008',
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 'opt-comisaria-2-b',
        questionId: 'que-comisaria-2',
        text: 'Ley 1098 de 2006, Ley 1257 de 2008',
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 'opt-comisaria-2-c',
        questionId: 'que-comisaria-2',
        text: 'Ley 1098 de 2006, Ley 1257 de 2008, Ley 1448 de 2011',
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 'opt-comisaria-3-a',
        questionId: 'que-comisaria-3',
        text: 'Escucha activa, detectar ciclos de violencia, valoración de feminicidio y ruta clínica',
        isCorrect: false,
        orderIndex: 1,
      },
      {
        id: 'opt-comisaria-3-b',
        questionId: 'que-comisaria-3',
        text: 'Valoración psicológica, escucha activa, detectar ciclos de violencia y rutas de derivación',
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 'opt-comisaria-3-c',
        questionId: 'que-comisaria-3',
        text: 'Valoración psicológica, nivel de riesgo, valoración de feminicidio y rutas de derivación',
        isCorrect: true,
        orderIndex: 3,
      },
    ];
    return {
      users: [superAdmin, teacher, student],
      teacherProfiles: [
        {
          id: 'tpr-demo',
          userId: teacher.id,
          institution: 'Universidad Demo',
          area: 'Psicologia',
          canCreateCases: true,
          createdAt: now,
        },
      ],
      platformSettings: { emergencyLockout: false, updatedAt: now },
      studentProfiles: [
        {
          id: 'spr-demo',
          userId: student.id,
          code: '1020304050',
          nickname: '',
          avatarId: DEFAULT_AVATAR_ID,
          onboardingCompleted: false,
          createdAt: now,
        },
      ],
      groups: [group],
      groupStudents: [{ id: 'gst-demo', groupId: group.id, studentId: student.id, joinedAt: now }],
      situations: [situation],
      scenarios: [hospital, comisaria],
      questions,
      answerOptions,
      groupTasks: [
        {
          id: 'tsk-demo',
          groupId: group.id,
          situationId: situation.id,
          scenarioIds: [hospital.id, comisaria.id],
          questionIds: [
            'que-hospital-1',
            'que-hospital-2',
            'que-hospital-3',
            'que-comisaria-1',
            'que-comisaria-2',
            'que-comisaria-3',
          ],
          assignedAt: now,
        },
      ],
      studentAnswers: [],
      studentProgress: [],
      rubricas: [],
      intentosEstudiante: [],
      taskSessions: [
        {
          id: 'ses-demo',
          taskId: 'tsk-demo',
          groupId: group.id,
          situationId: situation.id,
          teacherId: teacher.id,
          scheduledStartAt: now,
          scheduledEndAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          maxDurationMinutes: 120,
          estimatedMinutes: 90,
          academicSpace: 'Grupo PAP y rutas de atención',
          location: 'Campus virtual MIND-SPHERE',
          authorizedStudentIds: [student.id],
          status: 'IN_PROGRESS',
          startedAt: now,
          allowRetries: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      sessionAuthorizations: [
        {
          id: 'sau-demo',
          sessionId: 'ses-demo',
          taskId: 'tsk-demo',
          studentId: student.id,
          authCode: 'MS-DEMO001',
          createdAt: now,
        },
      ],
      notifications: [],
    };
  }
}
