import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameGroup, GroupTask, Question, Scenario, User } from '../models/academy.models';
import { AcademyDataService } from '../services/academy-data.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-student-home-page',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="student-shell">
      <header class="student-header">
        <div>
          <div class="student-brand">
            <img class="app-logo" src="/psych-simulator-logo.svg" alt="" aria-hidden="true" />
            <div>
              <p class="eyebrow">Estudiante</p>
              <h1>{{ pageTitle() }}</h1>
            </div>
          </div>
          <p>{{ pageIntro() }}</p>
        </div>
        <button class="ghost-button" type="button" (click)="auth.logout()">Cerrar sesion</button>
      </header>

      <nav class="student-flow" aria-label="Navegacion del estudiante">
        <button type="button" class="active-nav" (click)="goBackInFlow()">{{ currentMenuLabel() }}</button>
      </nav>

      @if (view === 'groups') {
        <section class="student-view">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Menu de grupos</p>
              <h2>Grupos inscritos</h2>
            </div>
            <p>Selecciona un grupo para ver las tareas que tu profesor asigno.</p>
          </div>

          <div class="student-card-grid">
            @for (group of groups(); track group.id) {
              <button class="classroom-card group-entry-card" type="button" (click)="openGroup(group.id)">
                <span class="entry-topline">
                  <strong>{{ group.name }}</strong>
                  <small>{{ pendingTasksForGroup(group.id) }} pendientes</small>
                </span>
                <span>{{ group.description }}</span>
                <small>{{ tasksForGroup(group.id).length }} tareas asignadas</small>
              </button>
            } @empty {
              <article class="panel">
                <p class="muted">Aun no perteneces a ningun grupo.</p>
              </article>
            }
          </div>
        </section>
      }

      @if (view === 'tasks') {
        <section class="student-view">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Grupo seleccionado</p>
              <h2>{{ selectedGroup()?.name ?? 'Tareas' }}</h2>
            </div>
            <button class="ghost-button" type="button" (click)="showGroups()">Volver a grupos</button>
          </div>

          <section class="panel">
            <h2>Listado de tareas pendientes</h2>
            <div class="task-list">
              @for (task of tasks(); track task.id) {
                <button class="task-row" type="button" (click)="openTask(task.id)">
                  <span>
                    <strong>{{ taskTitle(task) }}</strong>
                    <small>{{ task.scenarioIds.length }} escenarios - {{ task.questionIds.length }} preguntas</small>
                  </span>
                  <span class="task-progress">
                    <meter min="0" max="100" [value]="progress(task.id).progressPercentage"></meter>
                    <small>{{ taskState(task.id) }}</small>
                  </span>
                </button>
              } @empty {
                <p class="muted">Este grupo aun no tiene tareas asignadas.</p>
              }
            </div>
          </section>
        </section>
      }

      @if (view === 'task') {
        <section class="student-view">
          <div class="section-heading">
            <div>
              <p class="eyebrow">{{ selectedGroup()?.name ?? 'Ejercicio' }}</p>
              <h2>{{ selectedTask() ? taskTitle(selectedTask()!) : 'Tarea' }}</h2>
            </div>
            <button class="ghost-button" type="button" (click)="showTasks()">Volver a tareas</button>
          </div>

          @if (selectedTask(); as task) {
            @if (selectedSituation(task); as situation) {
              <section class="panel scenario-reader">
                <div class="reader-intro">
                  <p class="eyebrow">{{ situation.difficulty }}</p>
                  <h2>{{ situation.title }}</h2>
                  <p>{{ situation.context }}</p>
                  <strong>Objetivo: {{ situation.learningObjective }}</strong>
                </div>

                @for (scenario of scenarios(task); track scenario.id) {
                  <article class="scenario-block">
                    <h3>{{ scenario.orderIndex }}. {{ scenario.title }}</h3>
                    <p>{{ scenario.context }}</p>
                    <small>{{ scenario.instructions }}</small>

                    @for (question of questions(task, scenario); track question.id) {
                      <div class="question-card">
                        <p class="question-category">{{ question.category }}</p>
                        <h4>{{ question.statement }}</h4>
                        <div class="answer-grid">
                          @for (option of data.optionsForQuestion(question.id); track option.id) {
                            <button
                              type="button"
                              class="answer-button"
                              [class.selected]="answer(question.id)?.selectedOptionId === option.id"
                              [class.correct]="answer(question.id)?.selectedOptionId === option.id && answer(question.id)?.isCorrect"
                              [class.incorrect]="answer(question.id)?.selectedOptionId === option.id && answer(question.id)?.isCorrect === false"
                              (click)="answerQuestion(task.id, question.id, option.id)"
                            >
                              {{ option.text }}
                            </button>
                          }
                        </div>
                        @if (answer(question.id)) {
                          <div class="feedback-box">
                            <strong>{{ answer(question.id)?.isCorrect ? 'Respuesta adecuada' : 'Respuesta por revisar' }}</strong>
                            <span>{{ question.feedback }}</span>
                          </div>
                        }
                      </div>
                    }
                  </article>
                }
              </section>
            }
          }
        </section>
      }
    </div>
  `,
})
export class StudentHomePage {
  view: 'groups' | 'tasks' | 'task' = 'groups';
  selectedGroupId = '';
  selectedTaskId = '';

  constructor(
    public readonly data: AcademyDataService,
    public readonly auth: AuthService,
  ) {}

  pageTitle(): string {
    if (this.view === 'task') {
      return 'Resolver tarea';
    }
    if (this.view === 'tasks') {
      return 'Tareas del grupo';
    }
    return 'Mis grupos';
  }

  pageIntro(): string {
    if (this.view === 'task') {
      return 'Lee el caso, revisa cada escenario y responde las preguntas asignadas.';
    }
    if (this.view === 'tasks') {
      return 'Elige una tarea pendiente para abrir el ejercicio completo.';
    }
    return 'Primero selecciona uno de los grupos donde tu profesor te inscribio.';
  }

  currentMenuLabel(): string {
    if (this.view === 'task' && this.selectedTask()) {
      return this.taskTitle(this.selectedTask()!);
    }
    if ((this.view === 'tasks' || this.view === 'task') && this.selectedGroup()) {
      return this.selectedGroup()!.name;
    }
    return 'Grupos';
  }

  student(): User | null {
    return this.auth.currentUser();
  }

  groups(): GameGroup[] {
    const student = this.student();
    return student ? this.data.groupsForStudent(student.id) : [];
  }

  tasksForGroup(groupId: string): GroupTask[] {
    const student = this.student();
    return student ? this.data.tasksForStudentInGroup(student.id, groupId) : [];
  }

  openGroup(groupId: string): void {
    this.selectedGroupId = groupId;
    this.selectedTaskId = '';
    this.view = 'tasks';
  }

  openTask(taskId: string): void {
    this.selectedTaskId = taskId;
    this.view = 'task';
  }

  showGroups(): void {
    this.view = 'groups';
  }

  showTasks(): void {
    if (this.selectedGroupId) {
      this.view = 'tasks';
    }
  }

  showTask(): void {
    if (this.selectedTaskId) {
      this.view = 'task';
    }
  }

  goBackInFlow(): void {
    if (this.view === 'task') {
      this.showTasks();
      return;
    }
    if (this.view === 'tasks') {
      this.showGroups();
    }
  }

  tasks(): GroupTask[] {
    return this.selectedGroupId ? this.tasksForGroup(this.selectedGroupId) : [];
  }

  selectedGroup(): GameGroup | undefined {
    return this.groups().find((group) => group.id === this.selectedGroupId);
  }

  selectedTask(): GroupTask | undefined {
    return this.tasks().find((task) => task.id === this.selectedTaskId);
  }

  selectedSituation(task: GroupTask) {
    return this.data.situationForTask(task);
  }

  taskTitle(task: GroupTask): string {
    return this.data.situationForTask(task)?.title ?? 'Tarea';
  }

  scenarios(task: GroupTask): Scenario[] {
    return this.data.scenariosForTask(task);
  }

  questions(task: GroupTask, scenario: Scenario): Question[] {
    return this.data.questionsForTask(task, scenario.id);
  }

  answer(questionId: string) {
    const student = this.student();
    return student ? this.data.answerForQuestion(student.id, questionId) : undefined;
  }

  answerQuestion(taskId: string, questionId: string, optionId: string): void {
    const student = this.student();
    if (student) {
      this.data.answerQuestion(student.id, taskId, questionId, optionId);
    }
  }

  progress(taskId: string) {
    const student = this.student();
    return student
      ? this.data.progressFor(student.id, taskId)
      : { progressPercentage: 0, completed: false, id: '', studentId: '', taskId, updatedAt: '' };
  }

  taskState(taskId: string): string {
    const progress = this.progress(taskId);
    return progress.completed ? 'Completada' : `Pendiente ${progress.progressPercentage}%`;
  }

  pendingTasksForGroup(groupId: string): number {
    return this.tasksForGroup(groupId).filter((task) => !this.progress(task.id).completed).length;
  }
}
