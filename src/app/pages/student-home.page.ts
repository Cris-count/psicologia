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
          <p class="eyebrow">Estudiante</p>
          <h1>Mis grupos</h1>
          <p>Responde las tareas que tu maestro armo con situaciones, escenarios y preguntas seleccionadas.</p>
        </div>
        <button class="ghost-button" type="button" (click)="auth.logout()">Cerrar sesion</button>
      </header>

      <section class="student-grid">
        <aside class="panel">
          <h2>Grupos</h2>
          <div class="card-list">
            @for (group of groups(); track group.id) {
              <button class="classroom-card" type="button" (click)="selectGroup(group.id)">
                <strong>{{ group.name }}</strong>
                <span>{{ group.description }}</span>
                <small>{{ tasksForGroup(group.id).length }} tareas asignadas</small>
              </button>
            } @empty {
              <p class="muted">Aun no perteneces a ningun grupo.</p>
            }
          </div>
        </aside>

        <main class="learning-area">
          <section class="panel">
            <h2>Tareas asignadas</h2>
            <div class="situation-strip">
              @for (task of tasks(); track task.id) {
                <button class="situation-card" type="button" (click)="selectedTaskId = task.id">
                  <strong>{{ taskTitle(task) }}</strong>
                  <span>
                    {{ task.scenarioIds.length }} escenarios · {{ task.questionIds.length }} preguntas
                  </span>
                  <meter min="0" max="100" [value]="progress(task.id).progressPercentage"></meter>
                  <small>Avance {{ progress(task.id).progressPercentage }}%</small>
                </button>
              } @empty {
                <p class="muted">Selecciona un grupo con tareas asignadas por tu maestro.</p>
              }
            </div>
          </section>

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
        </main>
      </section>
    </div>
  `,
})
export class StudentHomePage {
  selectedGroupId = '';
  selectedTaskId = '';

  constructor(
    public readonly data: AcademyDataService,
    public readonly auth: AuthService,
  ) {
    this.selectedGroupId = this.groups()[0]?.id ?? '';
    this.selectedTaskId = this.tasks()[0]?.id ?? '';
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

  selectGroup(groupId: string): void {
    this.selectedGroupId = groupId;
    this.selectedTaskId = this.tasks()[0]?.id ?? '';
  }

  tasks(): GroupTask[] {
    return this.selectedGroupId ? this.tasksForGroup(this.selectedGroupId) : [];
  }

  selectedTask(): GroupTask | undefined {
    return this.tasks().find((task) => task.id === this.selectedTaskId) ?? this.tasks()[0];
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
}
