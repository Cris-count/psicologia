import { readFile } from 'node:fs/promises';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://psicologo:psicologo_secret@localhost:5432/psicologo',
});

const TABLES = [
  'student_answers',
  'student_progress',
  'answer_options',
  'questions',
  'scenarios',
  'group_tasks',
  'group_students',
  'situations',
  'game_groups',
  'teacher_profiles',
  'student_profiles',
  'users',
  'rubricas',
  'intentos_estudiante',
  'platform_settings',
  'task_sessions',
  'session_authorizations',
  'notifications',
];

function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function mapToDb(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toSnakeCase(key)] = value;
  }
  return result;
}

async function insertTable(client, tableName, rows) {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const cols = keys.join(', ');
  const params = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${tableName} (${cols}) VALUES (${params}) ON CONFLICT (id) DO NOTHING`;
  for (const row of rows) {
    await client.query(sql, keys.map((k) => row[k] ?? null));
  }
}

async function migrate() {
  const storePath = process.env.STORE_PATH || '/data/academy-store.json';
  const raw = await readFile(storePath, 'utf8').catch((e) => {
    if (e.code === 'ENOENT') return null;
    throw e;
  });
  if (!raw) {
    console.log('No JSON store found at', storePath, '- nothing to migrate');
    return;
  }
  const store = JSON.parse(raw);
  console.log('Migrating store with', store.users?.length ?? 0, 'users...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`TRUNCATE ${TABLES.join(', ')} CASCADE`);

    if (store.users?.length) {
      await insertTable(client, 'users', store.users.map(mapToDb));
      console.log(`  Migrated ${store.users.length} users`);
    }
    if (store.teacherProfiles?.length) {
      await insertTable(client, 'teacher_profiles', store.teacherProfiles.map(mapToDb));
      console.log(`  Migrated ${store.teacherProfiles.length} teacher profiles`);
    }
    if (store.studentProfiles?.length) {
      await insertTable(client, 'student_profiles', store.studentProfiles.map(mapToDb));
      console.log(`  Migrated ${store.studentProfiles.length} student profiles`);
    }
    if (store.groups?.length) {
      await insertTable(client, 'game_groups', store.groups.map(mapToDb));
      console.log(`  Migrated ${store.groups.length} groups`);
    }
    if (store.groupStudents?.length) {
      await insertTable(client, 'group_students', store.groupStudents.map(mapToDb));
      console.log(`  Migrated ${store.groupStudents.length} group students`);
    }
    if (store.situations?.length) {
      await insertTable(client, 'situations', store.situations.map(mapToDb));
      console.log(`  Migrated ${store.situations.length} situations`);
    }
    if (store.scenarios?.length) {
      await insertTable(client, 'scenarios', store.scenarios.map(mapToDb));
      console.log(`  Migrated ${store.scenarios.length} scenarios`);
    }
    if (store.questions?.length) {
      await insertTable(client, 'questions', store.questions.map(mapToDb));
      console.log(`  Migrated ${store.questions.length} questions`);
    }
    if (store.answerOptions?.length) {
      await insertTable(client, 'answer_options', store.answerOptions.map(mapToDb));
      console.log(`  Migrated ${store.answerOptions.length} answer options`);
    }
    if (store.groupTasks?.length) {
      const mapped = store.groupTasks.map((t) => ({
        ...mapToDb(t),
        scenario_ids: t.scenarioIds ?? [],
        question_ids: t.questionIds ?? [],
      }));
      await insertTable(client, 'group_tasks', mapped);
      console.log(`  Migrated ${store.groupTasks.length} group tasks`);
    }
    if (store.studentAnswers?.length) {
      await insertTable(client, 'student_answers', store.studentAnswers.map(mapToDb));
      console.log(`  Migrated ${store.studentAnswers.length} student answers`);
    }
    if (store.studentProgress?.length) {
      await insertTable(client, 'student_progress', store.studentProgress.map(mapToDb));
      console.log(`  Migrated ${store.studentProgress.length} student progress entries`);
    }
    if (store.rubricas?.length) {
      await insertTable(client, 'rubricas', store.rubricas.map((r) => ({ id: r.id, data: JSON.stringify(r) })));
      console.log(`  Migrated ${store.rubricas.length} rubricas`);
    }
    if (store.intentosEstudiante?.length) {
      await insertTable(client, 'intentos_estudiante', store.intentosEstudiante.map((r) => ({ id: r.id, data: JSON.stringify(r) })));
      console.log(`  Migrated ${store.intentosEstudiante.length} intentos`);
    }
    if (store.platformSettings) {
      await insertTable(client, 'platform_settings', [{
        id: 'default',
        emergency_lockout: store.platformSettings.emergencyLockout ?? false,
        updated_at: store.platformSettings.updatedAt ?? new Date().toISOString(),
      }]);
      console.log('  Migrated platform settings');
    }
    if (store.taskSessions?.length) {
      await insertTable(client, 'task_sessions', store.taskSessions.map((r) => ({ id: r.id, data: JSON.stringify(r) })));
      console.log(`  Migrated ${store.taskSessions.length} task sessions`);
    }
    if (store.sessionAuthorizations?.length) {
      await insertTable(client, 'session_authorizations', store.sessionAuthorizations.map((r) => ({ id: r.id, data: JSON.stringify(r) })));
      console.log(`  Migrated ${store.sessionAuthorizations.length} session authorizations`);
    }
    if (store.notifications?.length) {
      await insertTable(client, 'notifications', store.notifications.map((r) => ({ id: r.id, data: JSON.stringify(r) })));
      console.log(`  Migrated ${store.notifications.length} notifications`);
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Migration failed:', e);
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
