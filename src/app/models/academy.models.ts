export type UserRole = 'SUPERADMIN' | 'TEACHER' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type GroupStatus = 'ACTIVE' | 'INACTIVE';
export type SituationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type Difficulty = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
export type QuestionCategory = 'TECHNICAL' | 'ETHICAL' | 'NORMATIVE' | 'PSYCHOSOCIAL' | 'CARE_ROUTE';
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN' | 'PSYCH_ANALYSIS' | 'DECISION';
export type SituationCategory = 'CLINICAL' | 'PSYCHOSOCIAL' | 'ETHICS' | 'CRISIS' | 'DEVELOPMENT' | 'ORGANIZATIONAL';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type TeacherAvatarId =
  | 'teach-valentina'
  | 'teach-camila'
  | 'teach-andres'
  | 'teach-isabella'
  | 'teach-sebastian'
  | 'teach-maria'
  | 'teach-tomas';

export interface TeacherProfile {
  id: string;
  userId: string;
  institution: string;
  area: string;
  /** REQ-01: solo docentes con este flag pueden crear casos (REQ-02). */
  canCreateCases: boolean;
  avatarId?: TeacherAvatarId;
  characterName?: string;
  avatarConfigured?: boolean;
  createdAt: string;
}

export type AvatarId =
  | 'psych-alejandro'
  | 'psych-valeria'
  | 'psych-mateo'
  | 'psych-sofia'
  | 'psych-daniel'
  | 'psych-isabella'
  | 'psych-simon'
  | 'psych-camila'
  | 'psych-sebastian'
  | 'psych-laura';
export type AvatarRarity = 'COMMON' | 'RARE' | 'EPIC';

export type AccessorySlot = 'headwear' | 'eyewear' | 'badge' | 'effect';

export type HeadwearId = 'head-none' | 'visor-cyber' | 'cap-field' | 'crown-elite';
export type EyewearId = 'eyes-none' | 'lens-lab' | 'shade-cool';
export type BadgeAccessoryId = 'badge-none' | 'badge-psi' | 'badge-neural';
export type EffectId = 'effect-none' | 'aura-soft' | 'aura-flare';

export type AccessoryId = HeadwearId | EyewearId | BadgeAccessoryId | EffectId;

export interface AvatarAccessories {
  headwear: HeadwearId;
  eyewear: EyewearId;
  badge: BadgeAccessoryId;
  effect: EffectId;
}

export type AppearanceSlot = 'skin' | 'hairColor' | 'hairStyle' | 'eyes' | 'outfit';

export type SkinToneId = 'skin-1' | 'skin-2' | 'skin-3' | 'skin-4' | 'skin-5' | 'skin-6' | 'skin-7' | 'skin-8';
export type HairColorId =
  | 'hair-1'
  | 'hair-2'
  | 'hair-3'
  | 'hair-4'
  | 'hair-5'
  | 'hair-6'
  | 'hair-7'
  | 'hair-8'
  | 'hair-9'
  | 'hair-10';
export type HairStyleId = 'style-short' | 'style-medium' | 'style-long' | 'style-bun' | 'style-curly' | 'style-fade';
export type EyeColorId = 'eye-1' | 'eye-2' | 'eye-3' | 'eye-4' | 'eye-5' | 'eye-6';
export type OutfitColorId = 'cloth-1' | 'cloth-2' | 'cloth-3' | 'cloth-4' | 'cloth-5' | 'cloth-6' | 'cloth-7' | 'cloth-8';

export type AppearanceOptionId = SkinToneId | HairColorId | HairStyleId | EyeColorId | OutfitColorId;

export interface AvatarAppearance {
  skinTone: SkinToneId;
  hairColor: HairColorId;
  hairStyle: HairStyleId;
  eyeColor: EyeColorId;
  outfitColor: OutfitColorId;
}

export interface StudentProfile {
  id: string;
  userId: string;
  /** Tarjeta de identidad / documento (login estudiante). */
  code: string;
  nickname?: string;
  characterName?: string;
  avatarId?: AvatarId;
  avatarLook?: import('../shared/guide/data/avatar-look.types').AvatarLook;
  /** URL GLB exportada por Ready Player Me (avatar estilo Bitmoji). */
  rpmAvatarUrl?: string;
  appearance?: AvatarAppearance;
  accessories?: AvatarAccessories;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GameGroup {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GroupStudent {
  id: string;
  groupId: string;
  studentId: string;
  joinedAt: string;
}

/** Identificador del mapa 2D del simulador (ver game2d/map.registry). */
export type MapEnvironmentKey =
  | 'attention-routes'
  | 'clinical-office'
  | 'university-campus'
  | 'hospital'
  | 'research-lab'
  | 'mind-campus';

export type InteractableKindKey = 'npc' | 'terminal' | 'patient' | 'desk' | 'portal' | 'door';

export interface Situation {
  id: string;
  title: string;
  description: string;
  context: string;
  learningObjective: string;
  difficulty: Difficulty;
  category: SituationCategory;
  status: SituationStatus;
  createdById: string;
  resources?: string;
  /** Mundo 2D donde se desarrolla la misión */
  mapEnvironment?: MapEnvironmentKey;
  /** Título del panel introductorio del simulador (solo al inicio). */
  generalContextTitle?: string;
  /** Contexto general del caso (solo al inicio del simulador). */
  generalContextBody?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scenario {
  id: string;
  situationId: string;
  title: string;
  context: string;
  instructions: string;
  orderIndex: number;
  /** Título del panel de contexto previo a las preguntas. */
  contextPanelTitle?: string;
  /** Texto extendido del contexto antes de iniciar preguntas. */
  contextPanelBody?: string;
  /** Punto interactivo en el mapa (NPC, terminal, paciente, etc.) */
  interactableKind?: InteractableKindKey;
  createdAt: string;
}

export interface Question {
  id: string;
  scenarioId: string;
  statement: string;
  category: QuestionCategory;
  questionType: QuestionType;
  points: number;
  orderIndex: number;
  feedback: string;
  nextQuestionId?: string;
  createdAt: string;
}

export interface AnswerOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
  nextQuestionId?: string;
}

export interface GroupTask {
  id: string;
  groupId: string;
  situationId: string;
  scenarioIds: string[];
  questionIds: string[];
  assignedAt: string;
}

export interface StudentAnswer {
  id: string;
  studentId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  taskId: string;
  progressPercentage: number;
  completed: boolean;
  updatedAt: string;
  notaFinal?: number;
  respuestasCorrectas?: number;
  respuestasIncorrectas?: number;
  porcentajeAcierto?: number;
  intentoId?: string;
  completedAt?: string;
}

export interface PlatformSettings {
  emergencyLockout: boolean;
  updatedAt: string;
}

export interface AcademyStore {
  users: User[];
  teacherProfiles: TeacherProfile[];
  studentProfiles: StudentProfile[];
  groups: GameGroup[];
  groupStudents: GroupStudent[];
  situations: Situation[];
  scenarios: Scenario[];
  questions: Question[];
  answerOptions: AnswerOption[];
  groupTasks: GroupTask[];
  studentAnswers: StudentAnswer[];
  studentProgress: StudentProgress[];
  rubricas?: import('./evaluation.models').RubricaEvaluacion[];
  intentosEstudiante?: import('./evaluation.models').IntentoEstudiante[];
  platformSettings?: PlatformSettings;
  taskSessions?: import('./session.models').TaskSession[];
  sessionAuthorizations?: import('./session.models').SessionAuthorization[];
  notifications?: import('./session.models').NotificationRecord[];
}

export interface TaskInviteeDraft {
  name: string;
  email: string;
  documentId: string;
}

export interface TaskDraft {
  groupId: string;
  situationId: string;
  scenarioIds: string[];
  questionIds: string[];
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  maxDurationMinutes?: number;
  estimatedMinutes?: number;
  customMessage?: string;
  academicSpace?: string;
  location?: string;
  authorizedStudentIds?: string[];
  invitees?: TaskInviteeDraft[];
}

export type ScheduleTaskResult =
  | { ok: true; task: GroupTask; session: import('./session.models').TaskSession; authorizations: import('./session.models').SessionAuthorization[] }
  | { ok: false; error: string };

export interface QuestionDraft {
  statement: string;
  category: QuestionCategory;
  questionType: QuestionType;
  points: number;
  feedback: string;
  options: string[];
  correctIndex: number;
}

export interface SituationDraft {
  title: string;
  description: string;
  context: string;
  learningObjective: string;
  difficulty: Difficulty;
  category: SituationCategory;
  resources?: string;
  mapEnvironment?: MapEnvironmentKey;
  generalContextTitle?: string;
  generalContextBody?: string;
}

export interface ScenarioDraft {
  title: string;
  context: string;
  instructions: string;
  dialogues?: string;
  interactableKind?: InteractableKindKey;
}
