export type UserRole = 'TEACHER' | 'STUDENT' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type GroupStatus = 'ACTIVE' | 'INACTIVE';
export type SituationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type Difficulty = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
export type QuestionCategory = 'TECHNICAL' | 'ETHICAL' | 'NORMATIVE' | 'PSYCHOSOCIAL' | 'CARE_ROUTE';

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
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  code: string;
  createdAt: string;
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
  status: SituationStatus;
  teacherId: string;
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

export interface GroupSituation {
  id: string;
  groupId: string;
  situationId: string;
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
  situationId: string;
  progressPercentage: number;
  completed: boolean;
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
  groupSituations: GroupSituation[];
  studentAnswers: StudentAnswer[];
  studentProgress: StudentProgress[];
}

export interface QuestionDraft {
  statement: string;
  category: QuestionCategory;
  feedback: string;
  options: string[];
  correctIndex: number;
}
