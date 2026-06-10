/**
 * Sistema de presencia MIND-SPHERE — sesiones activas en tiempo real.
 * Usado por serve-static.mjs y el servidor de desarrollo.
 */
import { createServer } from 'node:http';

const TTL_MS = 90_000;
const sessions = new Map();
const sseClients = new Set();
let cleanupTimer = null;

function pruneExpired() {
  const now = Date.now();
  let changed = false;
  for (const [id, entry] of sessions) {
    if (now - entry.lastSeen > TTL_MS) {
      sessions.delete(id);
      changed = true;
    }
  }
  if (changed) broadcastCount();
}

function activeCount() {
  pruneExpired();
  return sessions.size;
}

function broadcastCount() {
  const count = sessions.size;
  const payload = `data: ${JSON.stringify({ count })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 16_384) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

export function handlePresenceRequest(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const path = url.pathname;

  if (!cleanupTimer) {
    cleanupTimer = setInterval(() => {
      pruneExpired();
    }, 30_000);
    cleanupTimer.unref?.();
  }

  if (path === '/api/presence/stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`data: ${JSON.stringify({ count: activeCount() })}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return true;
  }

  if (path === '/api/presence/count' && req.method === 'GET') {
    sendJson(res, 200, { count: activeCount() });
    return true;
  }

  if (path === '/api/presence/heartbeat' && req.method === 'POST') {
    void parseBody(req).then((body) => {
      const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
      if (!sessionId || sessionId.length > 128) {
        sendJson(res, 400, { error: 'sessionId requerido' });
        return;
      }
      const prev = sessions.get(sessionId);
      sessions.set(sessionId, {
        sessionId,
        userId: typeof body.userId === 'string' ? body.userId : null,
        path: typeof body.path === 'string' ? body.path : '/',
        lastSeen: Date.now(),
      });
      if (!prev || prev.userId !== body.userId) broadcastCount();
      else broadcastCount();
      sendJson(res, 200, { count: activeCount() });
    });
    return true;
  }

  if (path === '/api/presence/leave' && req.method === 'POST') {
    void parseBody(req).then((body) => {
      const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
      if (sessionId && sessions.delete(sessionId)) broadcastCount();
      sendJson(res, 200, { count: activeCount() });
    });
    return true;
  }

  return false;
}

export function createPresenceServer(port = 4201) {
  const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (handlePresenceRequest(req, res)) return;
    sendJson(res, 404, { error: 'Not found' });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(
        `[presence] Puerto ${port} ya en uso — otra instancia de pnpm dev sigue activa. Angular seguirá en http://localhost:4200`,
      );
      return;
    }
    console.error('[presence] Error al iniciar:', err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`[presence] API en http://localhost:${port}/api/presence`);
  });

  return server;
}
