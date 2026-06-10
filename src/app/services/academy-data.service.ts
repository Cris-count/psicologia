import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  AcademyStore,
  AnswerOption,
  AvatarId,
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
  User,
} from '../models/academy.models';

const STORE_KEY = 'academic-case-simulator-store-v5';

/** Credenciales demo — reinicio del simulador estudiante */
export const DEMO_STUDENT_ID = 'usr-student-demo';
export const DEMO_TASK_ID = 'tsk-demo';

@Injectable({ providedIn: 'root' })
export class AcademyDataService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly state = signal<AcademyStore>(this.loadInitialStore());
  readonly store = this.state.asReadonly();

  get users(): User[] {
    return this.store().users;
  }

  authenticate(email: string, password: string): User | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    return this.users.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.password === password && user.status === 'ACTIVE',
    );
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
    const userIds = new Set(this.store().users.map((u) => u.id));
    return this.store().situations.filter((situation) => {
      if (situation.status !== 'PUBLISHED') return false;
      if (situation.createdById === teacherId) return true;
      const creator = this.store().users.find((u) => u.id === situation.createdById);
      return creator?.role === 'SUPERADMIN';
    });
  }

  situationsByTeacher(teacherId: string): Situation[] {
    return this.store()
      .situations.filter((s) => s.createdById === teacherId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
    const cases = this.situationsByTeacher(teacherId);
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

  createStudent(name: string, email: string, password: string, code: string): User {
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
          code: code.trim() || `EST-${Date.now()}`,
          nickname: '',
          avatarId: 'neural-01',
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
    patch: { nickname?: string; avatarId?: AvatarId; onboardingCompleted?: boolean },
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

  /** El maestro vincula situacion, escenarios y preguntas mediante checklist. */
  assignTaskToGroup(draft: TaskDraft): GroupTask | undefined {
    const situation = this.store().situations.find((item) => item.id === draft.situationId);
    if (!situation || situation.status !== 'PUBLISHED') {
      return undefined;
    }

    const scenarioIds = [...new Set(draft.scenarioIds)].filter((id) => {
      const scenario = this.store().scenarios.find((item) => item.id === id);
      return scenario?.situationId === draft.situationId;
    });
    const questionIds = [...new Set(draft.questionIds)].filter((id) => {
      const question = this.store().questions.find((item) => item.id === id);
      if (!question) {
        return false;
      }
      const scenario = this.store().scenarios.find((item) => item.id === question.scenarioId);
      return scenario?.situationId === draft.situationId && scenarioIds.includes(question.scenarioId);
    });

    if (!scenarioIds.length || !questionIds.length) {
      return undefined;
    }

    const task: GroupTask = {
      id: this.id('tsk'),
      groupId: draft.groupId,
      situationId: draft.situationId,
      scenarioIds,
      questionIds,
      assignedAt: new Date().toISOString(),
    };
    this.commit({ ...this.store(), groupTasks: [task, ...this.store().groupTasks] });
    return task;
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
    return belongsToGroup ? this.tasksForGroup(groupId) : [];
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
    this.commit({ ...this.store(), studentAnswers, studentProgress });
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

  resultRowsForGroup(groupId: string): Array<{
    student: User;
    task: GroupTask;
    situation: Situation;
    progress: StudentProgress;
    correct: number;
    incorrect: number;
    pending: number;
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
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
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

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private normalizeStore(store: AcademyStore): AcademyStore {
    return {
      ...store,
      situations: store.situations.map((s) => ({
        ...s,
        category: s.category ?? 'CLINICAL',
        resources: s.resources ?? '',
      })),
      questions: store.questions.map((q) => ({
        ...q,
        questionType: q.questionType ?? 'MULTIPLE_CHOICE',
        points: q.points ?? 10,
      })),
      teacherProfiles: store.teacherProfiles.map((profile) => ({
        ...profile,
        canCreateCases: profile.canCreateCases ?? false,
      })),
      studentProfiles: store.studentProfiles.map((p) => ({
        ...p,
        nickname: p.nickname ?? '',
        avatarId: p.avatarId ?? 'neural-01',
        onboardingCompleted: p.onboardingCompleted ?? false,
      })),
      platformSettings: store.platformSettings ?? {
        emergencyLockout: false,
        updatedAt: new Date().toISOString(),
      },
    };
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
    const hospital: Scenario = {
      id: 'sce-hospital',
      situationId: situation.id,
      title: 'Atención en Hospital (Urgencia Vital y Crisis)',
      context:
        'La sobreviviente está en shock hipovolémico y emocional. La familia (madre y hermanos) llega al hospital en estado de alteración, exigiendo ver a la niña, quien ha fallecido, pero ellos aún no lo saben con certeza.',
      instructions: 'Responde las preguntas sobre intervención inmediata, marco normativo y protocolos clínicos.',
      orderIndex: 1,
      createdAt: now,
    };
    const comisaria: Scenario = {
      id: 'sce-comisaria',
      situationId: situation.id,
      title: 'Comisaría de Familia (Restablecimiento de Derechos)',
      context:
        'Han pasado 15 días. La mujer ha sido dada de alta, pero tiene secuelas físicas y trauma complejo. Se debe definir la medida de protección y el apoyo psicológico a largo plazo.',
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
          code: 'EST-001',
          nickname: '',
          avatarId: 'neural-01',
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
    };
  }
}
