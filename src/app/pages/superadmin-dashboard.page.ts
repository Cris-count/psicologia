import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Difficulty, QuestionCategory, Situation } from '../models/academy.models';
import { AcademyDataService } from '../services/academy-data.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-superadmin-dashboard-page',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div>
          <div class="sidebar-brand">
            <img class="app-logo" src="/psych-simulator-logo.svg" alt="" aria-hidden="true" />
            <div>
              <p class="eyebrow">Superadmin</p>
              <h1>Catalogo academico</h1>
            </div>
          </div>
          <p class="muted">Genera situaciones, escenarios y preguntas. El maestro las vincula en sus tareas.</p>
        </div>
        <nav>
          <button type="button" [class.active-nav]="activeSection === 'resumen'" (click)="showSection('resumen')">Resumen</button>
          <button type="button" [class.active-nav]="activeSection === 'situaciones'" (click)="showSection('situaciones')">Situaciones</button>
          <button type="button" [class.active-nav]="activeSection === 'escenarios'" (click)="showSection('escenarios')">Escenarios</button>
          <button type="button" [class.active-nav]="activeSection === 'preguntas'" (click)="showSection('preguntas')">Preguntas</button>
        </nav>
        <button class="ghost-button" type="button" (click)="auth.logout()">Cerrar sesion</button>
      </aside>

      <main class="content">
        <section class="page-header">
          <div>
            <p class="eyebrow">Gestion de contenido</p>
            <h2>Panel del superadministrador</h2>
            <p>Solo generas contenido del catalogo. La vinculacion pedagogica la hace el maestro con checklist.</p>
          </div>
          <div class="status-note">Usuario: {{ auth.currentUser()?.name }}</div>
        </section>

        @if (activeSection === 'resumen') {
          <section class="metric-grid">
            <article class="metric-card">
              <span>Situaciones</span>
              <strong>{{ situations().length }}</strong>
            </article>
            <article class="metric-card">
              <span>Publicadas</span>
              <strong>{{ publishedCount() }}</strong>
            </article>
            <article class="metric-card">
              <span>Escenarios</span>
              <strong>{{ data.store().scenarios.length }}</strong>
            </article>
            <article class="metric-card">
              <span>Preguntas</span>
              <strong>{{ data.store().questions.length }}</strong>
            </article>
          </section>
        }

        @if (activeSection === 'situaciones') {
          <section class="workspace-grid wide-left">
            <article class="panel">
              <h3>Generar situacion</h3>
              <form class="stack-form" (ngSubmit)="createSituation()">
                <label>Titulo <input name="situationTitle" [(ngModel)]="situationTitle" required /></label>
                <label>Descripcion <textarea name="situationDescription" [(ngModel)]="situationDescription"></textarea></label>
                <label>Contexto narrativo <textarea name="situationContext" [(ngModel)]="situationContext"></textarea></label>
                <label>Objetivo de aprendizaje <textarea name="learningObjective" [(ngModel)]="learningObjective"></textarea></label>
                <label>
                  Dificultad
                  <select name="difficulty" [(ngModel)]="difficulty">
                    <option value="BASIC">Basica</option>
                    <option value="INTERMEDIATE">Intermedia</option>
                    <option value="ADVANCED">Avanzada</option>
                  </select>
                </label>
                <button class="primary-button" type="submit">Generar situacion</button>
              </form>
            </article>

            <article class="panel">
              <h3>Situaciones generadas</h3>
              <div class="list">
                @for (situation of situations(); track situation.id) {
                  <div class="case-item">
                    <button class="plain-select" type="button" (click)="selectedSituationId = situation.id">
                      <strong>{{ situation.title }}</strong>
                      <small>{{ situation.status }} - {{ situation.difficulty }}</small>
                    </button>
                    <select
                      [ngModel]="situation.status"
                      (ngModelChange)="changeStatus(situation, $event)"
                      [name]="'status-' + situation.id"
                    >
                      <option value="DRAFT">Borrador</option>
                      <option value="PUBLISHED">Publicada</option>
                      <option value="ARCHIVED">Archivada</option>
                    </select>
                  </div>
                } @empty {
                  <p class="muted">Aun no hay situaciones generadas.</p>
                }
              </div>
            </article>
          </section>
        }

        @if (activeSection === 'escenarios') {
          <section class="workspace-grid wide-left">
            <article class="panel">
              <h3>Generar escenario</h3>
              <p class="form-hint">Define el escenario dentro de una situacion. El maestro decide luego si lo usa en una tarea.</p>
              <form class="stack-form" (ngSubmit)="createScenario()">
                <label>
                  Situacion base
                  <select name="scenarioSituation" [(ngModel)]="selectedSituationId" required>
                    @for (situation of situations(); track situation.id) {
                      <option [value]="situation.id">{{ situation.title }}</option>
                    }
                  </select>
                </label>
                <label>Titulo <input name="scenarioTitle" [(ngModel)]="scenarioTitle" required /></label>
                <label>Contexto <textarea name="scenarioContext" [(ngModel)]="scenarioContext"></textarea></label>
                <label>Instrucciones <textarea name="scenarioInstructions" [(ngModel)]="scenarioInstructions"></textarea></label>
                <button class="primary-button" type="submit">Generar escenario</button>
              </form>
            </article>

            <article class="panel">
              <h3>Escenarios de la situacion seleccionada</h3>
              @for (scenario of scenariosForSelectedSituation(); track scenario.id) {
                <article class="scenario-block">
                  <h4>{{ scenario.orderIndex }}. {{ scenario.title }}</h4>
                  <p class="muted">{{ scenario.context }}</p>
                </article>
              } @empty {
                <p class="muted">Selecciona o genera una situacion con escenarios.</p>
              }
            </article>
          </section>
        }

        @if (activeSection === 'preguntas') {
          <section class="workspace-grid wide-left">
            <article class="panel">
              <h3>Generar pregunta</h3>
              <p class="form-hint">Crea preguntas con opciones y retroalimentacion. El maestro elige cuales incluir en cada tarea.</p>
              <form class="stack-form" (ngSubmit)="createQuestion()">
                <label>
                  Situacion
                  <select name="questionSituation" [(ngModel)]="selectedSituationId" required>
                    @for (situation of situations(); track situation.id) {
                      <option [value]="situation.id">{{ situation.title }}</option>
                    }
                  </select>
                </label>
                <label>
                  Escenario
                  <select name="questionScenario" [(ngModel)]="selectedScenarioId" required>
                    @for (scenario of scenariosForSelectedSituation(); track scenario.id) {
                      <option [value]="scenario.id">{{ scenario.title }}</option>
                    }
                  </select>
                </label>
                <label>Enunciado <textarea name="questionStatement" [(ngModel)]="questionStatement" required></textarea></label>
                <label>
                  Categoria
                  <select name="questionCategory" [(ngModel)]="questionCategory">
                    <option value="TECHNICAL">Tecnica</option>
                    <option value="ETHICAL">Etica</option>
                    <option value="NORMATIVE">Normativa</option>
                    <option value="PSYCHOSOCIAL">Psicosocial</option>
                    <option value="CARE_ROUTE">Ruta de atencion</option>
                  </select>
                </label>
                <label>Retroalimentacion <textarea name="questionFeedback" [(ngModel)]="questionFeedback"></textarea></label>
                @for (option of questionOptions; track $index) {
                  <label>
                    Opcion {{ $index + 1 }}
                    <input [name]="'option-' + $index" [(ngModel)]="questionOptions[$index]" required />
                  </label>
                }
                <label>
                  Opcion correcta
                  <select name="correctIndex" [(ngModel)]="correctIndex">
                    @for (option of questionOptions; track $index) {
                      <option [ngValue]="$index">Opcion {{ $index + 1 }}</option>
                    }
                  </select>
                </label>
                <div class="button-row">
                  <button class="ghost-button" type="button" (click)="addOption()">Agregar opcion</button>
                  <button class="primary-button" type="submit">Generar pregunta</button>
                </div>
              </form>
            </article>

            <article class="panel">
              <h3>Preguntas generadas</h3>
              @for (scenario of scenariosForSelectedSituation(); track scenario.id) {
                <article class="scenario-block">
                  <h4>{{ scenario.title }}</h4>
                  @for (question of data.questionsForScenario(scenario.id); track question.id) {
                    <p class="muted">{{ question.statement }}</p>
                  } @empty {
                    <p class="muted">Sin preguntas en este escenario.</p>
                  }
                </article>
              } @empty {
                <p class="muted">Selecciona una situacion para ver sus preguntas.</p>
              }
            </article>
          </section>
        }
      </main>
    </div>
  `,
})
export class SuperadminDashboardPage {
  activeSection: 'resumen' | 'situaciones' | 'escenarios' | 'preguntas' = 'resumen';
  situationTitle = '';
  situationDescription = '';
  situationContext = '';
  learningObjective = '';
  difficulty: Difficulty = 'INTERMEDIATE';
  selectedSituationId = 'sit-demo';
  selectedScenarioId = 'sce-hospital';
  scenarioTitle = '';
  scenarioContext = '';
  scenarioInstructions = '';
  questionStatement = '';
  questionCategory: QuestionCategory = 'TECHNICAL';
  questionFeedback = '';
  questionOptions = ['', ''];
  correctIndex = 0;

  constructor(
    public readonly data: AcademyDataService,
    public readonly auth: AuthService,
  ) {}

  situations(): Situation[] {
    const user = this.auth.currentUser();
    return user ? this.data.situationsBySuperAdmin(user.id) : [];
  }

  publishedCount(): number {
    return this.situations().filter((situation) => situation.status === 'PUBLISHED').length;
  }

  scenariosForSelectedSituation() {
    return this.data.scenariosForSituation(this.selectedSituationId);
  }

  showSection(section: typeof this.activeSection): void {
    this.activeSection = section;
    document.querySelector('.content')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  createSituation(): void {
    const user = this.auth.currentUser();
    if (!user || !this.situationTitle.trim()) {
      return;
    }
    this.data.createSituation(
      user.id,
      this.situationTitle,
      this.situationDescription,
      this.situationContext,
      this.learningObjective,
      this.difficulty,
    );
    this.situationTitle = '';
    this.situationDescription = '';
    this.situationContext = '';
    this.learningObjective = '';
    this.selectedSituationId = this.situations()[0]?.id ?? '';
  }

  changeStatus(situation: Situation, status: Situation['status']): void {
    this.data.updateSituationStatus(situation.id, status);
  }

  createScenario(): void {
    if (!this.selectedSituationId || !this.scenarioTitle.trim()) {
      return;
    }
    this.data.createScenario(this.selectedSituationId, this.scenarioTitle, this.scenarioContext, this.scenarioInstructions);
    this.scenarioTitle = '';
    this.scenarioContext = '';
    this.scenarioInstructions = '';
    this.selectedScenarioId = this.scenariosForSelectedSituation().at(-1)?.id ?? this.selectedScenarioId;
  }

  addOption(): void {
    this.questionOptions = [...this.questionOptions, ''];
  }

  createQuestion(): void {
    if (!this.selectedScenarioId || !this.questionStatement.trim()) {
      return;
    }
    this.data.createQuestion(this.selectedScenarioId, {
      statement: this.questionStatement,
      category: this.questionCategory,
      feedback: this.questionFeedback,
      options: this.questionOptions,
      correctIndex: this.correctIndex,
    });
    this.questionStatement = '';
    this.questionFeedback = '';
    this.questionOptions = ['', ''];
    this.correctIndex = 0;
  }
}
