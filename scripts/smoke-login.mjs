import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const appUrl = 'http://127.0.0.1:4200/login';
const debugUrl = 'http://127.0.0.1:9229';
const chromeProfile = resolve('.tmp/chrome-smoke');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
    } catch {
      await wait(300);
    }
  }
  throw new Error(`Timeout esperando ${url}`);
}

function createCdp(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();

  socket.addEventListener('message', async (event) => {
    const payload =
      typeof event.data === 'string'
        ? event.data
        : event.data instanceof Blob
          ? await event.data.text()
          : Buffer.from(event.data).toString('utf8');
    const message = JSON.parse(payload);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result);
      }
    }
  });

  return {
    ready: new Promise((resolve) => socket.addEventListener('open', resolve, { once: true })),
    send(method, params = {}) {
      const id = nextId++;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Timeout CDP ${method}`));
        }, 10000);
        pending.set(id, {
          resolve: (value) => {
            clearTimeout(timeout);
            resolve(value);
          },
          reject: (error) => {
            clearTimeout(timeout);
            reject(error);
          },
        });
      });
    },
    close() {
      socket.close();
    },
  };
}

async function main() {
  await rm(chromeProfile, { recursive: true, force: true });
  const server = spawn(process.execPath, ['scripts/serve-static.mjs'], { stdio: 'ignore' });
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--no-first-run',
      `--user-data-dir=${chromeProfile}`,
      '--remote-debugging-address=127.0.0.1',
      '--remote-debugging-port=9229',
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let chromeOutput = '';
  chrome.stdout.on('data', (chunk) => (chromeOutput += chunk.toString()));
  chrome.stderr.on('data', (chunk) => (chromeOutput += chunk.toString()));

  try {
    console.log('Esperando servidor app...');
    await waitForHttp(appUrl);
    console.log('Esperando Chrome CDP...');
    try {
      await waitForHttp(`${debugUrl}/json/version`);
    } catch (error) {
      throw new Error(`${error.message}\nChrome output:\n${chromeOutput}`);
    }
    const tabResponse = await fetch(`${debugUrl}/json/new?${encodeURIComponent(appUrl)}`, { method: 'PUT' });
    const tabInfo = await tabResponse.json();
    console.log('Tab CDP:', tabInfo.type, tabInfo.url);
    const cdp = createCdp(tabInfo.webSocketDebuggerUrl);
    await cdp.ready;
    console.log('CDP conectado');
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Page.navigate', { url: appUrl });
    await wait(1200);

    const loginText = await cdp.send('Runtime.evaluate', {
      expression: "document.body.innerText.includes('Simulador de casos')",
      returnByValue: true,
    });
    if (!loginText.result.value) {
      throw new Error('No se renderizo la vista de login.');
    }

    await cdp.send('Runtime.evaluate', {
      expression: `
        const email = document.querySelector('input[name="email"]');
        const password = document.querySelector('input[name="password"]');
        email.value = 'docente@demo.edu';
        password.value = 'demo123';
        email.dispatchEvent(new Event('input', { bubbles: true }));
        password.dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('button[type="submit"]').click();
      `,
    });
    await wait(1500);

    const teacherState = await cdp.send('Runtime.evaluate', {
      expression: `({
        url: location.pathname,
        hasPanel: document.body.innerText.includes('Panel del profesor'),
        hasStudents: document.body.innerText.includes('Crear estudiante')
      })`,
      returnByValue: true,
    });

    if (teacherState.result.value.url !== '/teacher' || !teacherState.result.value.hasPanel) {
      throw new Error(`Login docente fallo: ${JSON.stringify(teacherState.result.value)}`);
    }

    await cdp.send('Runtime.evaluate', {
      expression: `
        [...document.querySelectorAll('.sidebar nav button')]
          .find((button) => button.textContent?.trim() === 'Estudiantes')
          ?.click();
      `,
    });
    await wait(500);

    const sectionState = await cdp.send('Runtime.evaluate', {
      expression: `({
        scrollY,
        hasHeading: document.body.innerText.includes('Estudiantes'),
        visibleCreateStudent: document.body.innerText.includes('Crear estudiante')
      })`,
      returnByValue: true,
    });

    if (!sectionState.result.value.hasHeading || !sectionState.result.value.visibleCreateStudent) {
      throw new Error(`Apartado estudiantes fallo: ${JSON.stringify(sectionState.result.value)}`);
    }

    console.log(JSON.stringify({ ok: true, teacher: teacherState.result.value, studentsSection: sectionState.result.value }, null, 2));
    cdp.close();
  } finally {
    chrome.kill();
    server.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
