import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  AcademyStore,
  AnswerOption,
  Difficulty,
  GameGroup,
  GroupSituation,
  GroupStudent,
  Question,
  QuestionCategory,
  QuestionDraft,
  Scenario,
  Situation,
  SituationStatus,
  StudentAnswer,
  StudentProgress,
  User,
} from '../models/academy.models';

const STORE_KEY = 'academic-case-simulator-store-v1';

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

  situationsByTeacher(teacherId: string): Situation[] {
    return this.store().situations.filter((situation) => situation.teacherId === teacherId);
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
        { id: this.id('spr'), userId: user.id, code: code.trim() || `EST-${Date.now()}`, createdAt: now },
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
    teacherId: string,
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
      status: 'DRAFT',
      teacherId,
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

  createScenario(situationId: string, title: string, context: string, instructions: string): void {
    const orderIndex = this.scenariosForSituation(situationId).length + 1;
    const scenario: Scenario = {
      id: this.id('sce'),
      situationId,
      title: title.trim(),
      context: context.trim(),
      instructions: instructions.trim(),
      orderIndex,
      createdAt: new Date().toISOString(),
    };
    this.commit({ ...this.store(), scenarios: [...this.store().scenarios, scenario] });
  }

  createQuestion(scenarioId: string, draft: QuestionDraft): void {
    const cleanOptions = draft.options.map((option) => option.trim()).filter(Boolean);
    if (cleanOptions.length < 2 || draft.correctIndex < 0 || draft.correctIndex >= cleanOptions.length) {
      return;
    }
    const questionId = this.id('que');
    const orderIndex = this.questionsForScenario(scenarioId).length + 1;
    const question: Question = {
      id: questionId,
      scenarioId,
      statement: draft.statement.trim(),
      category: draft.category,
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

  assignSituationToGroup(groupId: string, situationId: string): void {
    if (this.store().groupSituations.some((assignment) => assignment.groupId === groupId && assignment.situationId === situationId)) {
      return;
    }
    const assignment: GroupSituation = { id: this.id('gsi'), groupId, situationId, assignedAt: new Date().toISOString() };
    this.commit({ ...this.store(), groupSituations: [assignment, ...this.store().groupSituations] });
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
    const situationIds = new Set(
      this.store()
        .groupSituations.filter((assignment) => assignment.groupId === groupId)
        .map((assignment) => assignment.situationId),
    );
    return this.store().situations.filter(
      (situation) => situationIds.has(situation.id) && situation.status === 'PUBLISHED',
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

  answerQuestion(studentId: string, questionId: string, selectedOptionId: string): void {
    const option = this.store().answerOptions.find((item) => item.id === selectedOptionId);
    const question = this.store().questions.find((item) => item.id === questionId);
    const scenario = question ? this.store().scenarios.find((item) => item.id === question.scenarioId) : undefined;
    if (!option || !question || !scenario) {
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
    this.recalculateProgress(studentId, scenario.situationId);
  }

  answerForQuestion(studentId: string, questionId: string): StudentAnswer | undefined {
    return this.store().studentAnswers.find((answer) => answer.studentId === studentId && answer.questionId === questionId);
  }

  progressFor(studentId: string, situationId: string): StudentProgress {
    return (
      this.store().studentProgress.find((progress) => progress.studentId === studentId && progress.situationId === situationId) ?? {
        id: this.id('tmp'),
        studentId,
        situationId,
        progressPercentage: 0,
        completed: false,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  resultRowsForGroup(groupId: string): Array<{
    student: User;
    situation: Situation;
    progress: StudentProgress;
    correct: number;
    incorrect: number;
    pending: number;
  }> {
    const studentIds = this.store()
      .groupStudents.filter((membership) => membership.groupId === groupId)
      .map((membership) => membership.studentId);
    const situations = this.situationsForGroup(groupId);
    return studentIds.flatMap((studentId) => {
      const student = this.store().users.find((user) => user.id === studentId);
      if (!student) {
        return [];
      }
      return situations.map((situation) => {
        const questions = this.questionsForSituation(situation.id);
        const answers = questions
          .map((question) => this.answerForQuestion(studentId, question.id))
          .filter((answer): answer is StudentAnswer => Boolean(answer));
        return {
          student,
          situation,
          progress: this.progressFor(studentId, situation.id),
          correct: answers.filter((answer) => answer.isCorrect).length,
          incorrect: answers.filter((answer) => !answer.isCorrect).length,
          pending: Math.max(questions.length - answers.length, 0),
        };
      });
    });
  }

  questionsForSituation(situationId: string): Question[] {
    const scenarioIds = new Set(this.scenariosForSituation(situationId).map((scenario) => scenario.id));
    return this.store()
      .questions.filter((question) => scenarioIds.has(question.scenarioId))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  private recalculateProgress(studentId: string, situationId: string): void {
    const questions = this.questionsForSituation(situationId);
    const answered = questions.filter((question) => this.answerForQuestion(studentId, question.id)).length;
    const percentage = questions.length ? Math.round((answered / questions.length) * 100) : 0;
    const now = new Date().toISOString();
    const existing = this.store().studentProgress.find(
      (progress) => progress.studentId === studentId && progress.situationId === situationId,
    );
    const progress: StudentProgress = {
      id: existing?.id ?? this.id('prg'),
      studentId,
      situationId,
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
      return JSON.parse(saved) as AcademyStore;
    }
    return this.seedStore();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private seedStore(): AcademyStore {
    const now = new Date().toISOString();
    const teacher: User = {
      id: 'usr-teacher-demo',
      name: 'Docente Demo',
      email: 'docente@demo.edu',
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
      title: 'Caso situacional: violencia domestica y tentativa de feminicidio',
      description: 'Simulacion pedagogica para analizar decisiones de atencion, proteccion y acompanamiento.',
      context:
        'Prototipo academico. El caso se usa para entrenar lectura de contexto, priorizacion de riesgos y activacion de rutas, sin reemplazar herramientas clinicas, juridicas o institucionales reales.',
      learningObjective:
        'Reconocer acciones iniciales eticas, tecnicas y psicosociales ante una situacion de alta criticidad.',
      difficulty: 'INTERMEDIATE',
      status: 'PUBLISHED',
      teacherId: teacher.id,
      createdAt: now,
      updatedAt: now,
    };
    const hospital: Scenario = {
      id: 'sce-hospital',
      situationId: situation.id,
      title: 'Atencion en Hospital',
      context:
        'La persona afectada llega al servicio de urgencias en crisis emocional y con riesgo vital. El equipo debe priorizar estabilizacion, contencion y activacion de rutas.',
      instructions: 'Selecciona la respuesta tecnicamente mas adecuada para cada momento del flujo.',
      orderIndex: 1,
      createdAt: now,
    };
    const comisaria: Scenario = {
      id: 'sce-comisaria',
      situationId: situation.id,
      title: 'Comisaria de Familia',
      context:
        'Tras la atencion inicial, se requiere valorar riesgo, orientar medidas de proteccion y coordinar apoyos psicosociales.',
      instructions: 'Responde desde un enfoque de derechos, seguridad y no revictimizacion.',
      orderIndex: 2,
      createdAt: now,
    };
    const questions: Question[] = [
      {
        id: 'que-hospital-1',
        scenarioId: hospital.id,
        statement: 'Ante urgencia vital y crisis emocional, cual debe ser la primera prioridad del equipo?',
        category: 'TECHNICAL',
        orderIndex: 1,
        feedback:
          'La prioridad inicial es preservar la vida, estabilizar y acompanar emocionalmente con comunicacion clara y respetuosa.',
        createdAt: now,
      },
      {
        id: 'que-comisaria-1',
        scenarioId: comisaria.id,
        statement: 'Que accion evita revictimizacion durante la orientacion inicial?',
        category: 'PSYCHOSOCIAL',
        orderIndex: 1,
        feedback:
          'La escucha respetuosa, la explicacion de opciones y la reduccion de relatos repetidos ayudan a proteger a la persona.',
        createdAt: now,
      },
    ];
    const answerOptions: AnswerOption[] = [
      {
        id: 'opt-hospital-1-a',
        questionId: 'que-hospital-1',
        text: 'Estabilizar clinicamente, contener emocionalmente y activar rutas pertinentes.',
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 'opt-hospital-1-b',
        questionId: 'que-hospital-1',
        text: 'Solicitar primero un relato detallado de todos los hechos antes de atender.',
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 'opt-comisaria-1-a',
        questionId: 'que-comisaria-1',
        text: 'Escuchar, explicar derechos y coordinar medidas sin exigir narraciones innecesarias.',
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 'opt-comisaria-1-b',
        questionId: 'que-comisaria-1',
        text: 'Pedir que repita el caso ante cada funcionario para confirmar consistencia.',
        isCorrect: false,
        orderIndex: 2,
      },
    ];
    return {
      users: [teacher, student],
      teacherProfiles: [
        { id: 'tpr-demo', userId: teacher.id, institution: 'Universidad Demo', area: 'Psicologia', createdAt: now },
      ],
      studentProfiles: [{ id: 'spr-demo', userId: student.id, code: 'EST-001', createdAt: now }],
      groups: [group],
      groupStudents: [{ id: 'gst-demo', groupId: group.id, studentId: student.id, joinedAt: now }],
      situations: [situation],
      scenarios: [hospital, comisaria],
      questions,
      answerOptions,
      groupSituations: [{ id: 'gsi-demo', groupId: group.id, situationId: situation.id, assignedAt: now }],
      studentAnswers: [],
      studentProgress: [],
    };
  }
}
