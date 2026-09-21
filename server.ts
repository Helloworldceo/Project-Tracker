import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Durable storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory data store with fallback load
interface ServerDbState {
  tasks: any[];
  milestones: any[];
  project: any;
  notifications: any[];
  users: any[];
  version: number;
  lastUpdatedAt: string;
}

let dbState: ServerDbState = {
  tasks: [],
  milestones: [],
  project: null,
  notifications: [],
  users: [],
  version: 1,
  lastUpdatedAt: new Date().toISOString(),
};

// Load initial state if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    dbState = JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read existing db.json, starting fresh', err);
  }
}

function persistState() {
  try {
    dbState.version++;
    dbState.lastUpdatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist db.json', err);
  }
}

// SSE Connected clients for real-time collaboration updates
const sseClients = new Set<express.Response>();

function broadcastSseEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// ==================== API ROUTES ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connectedClients: sseClients.size,
  });
});

app.get('/api/ping', (req, res) => {
  res.json({
    serverTime: Date.now(),
    status: 'pong',
  });
});

// SSE endpoint for live real-time sync
app.get('/api/sync/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);

  // Send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ version: dbState.version })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Pull full sync state
app.get('/api/sync/pull', (req, res) => {
  res.json({
    tasks: dbState.tasks,
    milestones: dbState.milestones,
    project: dbState.project,
    notifications: dbState.notifications,
    version: dbState.version,
    lastUpdatedAt: dbState.lastUpdatedAt,
  });
});

// Push batch mutations from client (with offline queue support)
app.post('/api/sync/push', (req, res) => {
  const { mutations, clientState } = req.body;

  if (clientState) {
    // If client supplied complete sync snapshot or initialization
    if (clientState.tasks) dbState.tasks = clientState.tasks;
    if (clientState.milestones) dbState.milestones = clientState.milestones;
    if (clientState.project) dbState.project = clientState.project;
    if (clientState.notifications) dbState.notifications = clientState.notifications;
    persistState();

    broadcastSseEvent('sync_update', {
      version: dbState.version,
      source: 'client_push',
    });

    return res.json({
      success: true,
      version: dbState.version,
      message: 'State synchronized successfully',
    });
  }

  if (Array.isArray(mutations)) {
    for (const mut of mutations) {
      if (mut.type === 'CREATE_TASK') {
        dbState.tasks.push(mut.payload);
      } else if (mut.type === 'UPDATE_TASK') {
        const idx = dbState.tasks.findIndex((t: any) => t.id === mut.payload.id);
        if (idx >= 0) {
          dbState.tasks[idx] = { ...dbState.tasks[idx], ...mut.payload };
        } else {
          dbState.tasks.push(mut.payload);
        }
      } else if (mut.type === 'DELETE_TASK') {
        dbState.tasks = dbState.tasks.filter((t: any) => t.id !== mut.payload.id);
      } else if (mut.type === 'UPDATE_MILESTONE') {
        const idx = dbState.milestones.findIndex((m: any) => m.id === mut.payload.id);
        if (idx >= 0) {
          dbState.milestones[idx] = { ...dbState.milestones[idx], ...mut.payload };
        }
      }
    }
    persistState();
    broadcastSseEvent('sync_update', {
      version: dbState.version,
      mutationsCount: mutations.length,
    });
  }

  res.json({
    success: true,
    version: dbState.version,
  });
});

// Single task update
app.post('/api/tasks', (req, res) => {
  const newTask = req.body;
  if (!newTask.id) {
    newTask.id = `task-${Date.now()}`;
  }
  newTask.createdAt = newTask.createdAt || new Date().toISOString();
  newTask.updatedAt = new Date().toISOString();
  dbState.tasks.push(newTask);
  persistState();

  broadcastSseEvent('task_created', newTask);
  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = dbState.tasks.findIndex((t: any) => t.id === id);

  if (idx === -1) {
    dbState.tasks.push({ ...updates, id, updatedAt: new Date().toISOString() });
  } else {
    dbState.tasks[idx] = {
      ...dbState.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }
  persistState();

  broadcastSseEvent('task_updated', { id, updates });
  res.json({ success: true, task: dbState.tasks[idx] || updates });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  dbState.tasks = dbState.tasks.filter((t: any) => t.id !== id);
  persistState();

  broadcastSseEvent('task_deleted', { id });
  res.json({ success: true });
});

// ==================== VITE MIDDLEWARE & STATIC ====================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus Project Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

start();
