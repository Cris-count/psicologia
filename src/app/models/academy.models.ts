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

export interface TeacherProfile {
  id: string;
  userId: string;
  institution: string;
  area: string;
  /** REQ-01: solo docentes con este flag pueden crear casos (REQ-02). */
  canCreateCases: boolean;
  createdAt: string;
}

export type AvatarId = 'neural-01' | 'psyche-02' | 'cortex-03' | 'mind-04' | 'synapse-05' | 'pulse-06';
export type AvatarRarity = 'COMMON' | 'RARE' | 'EPIC';

export interface StudentProfile {
  id: string;
  userId: string;
  code: string;
  nickname?: string;
  avatarId?: AvatarId;
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
  platformSettings?: PlatformSettings;
}

export interface TaskDraft {
  groupId: string;
  situationId: string;
  scenarioIds: string[];
  questionIds: string[];
}

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
}

export interface ScenarioDraft {
  title: string;
  context: string;
  instructions: string;
  dialogues?: string;
}
