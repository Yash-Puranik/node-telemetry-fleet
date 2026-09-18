const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const START_TIME = Date.now();

let totalRequests = 0;
let simulatedFailure = false;

// Middleware: Request Telemetry Counter
app.use((req, res, next) => {
  totalRequests++;
  next();
});

// Helper: Format elapsed uptime
function getUptimeFormatted(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`;
}
app.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
  const mem = process.memoryUsage();

  if (simulatedFailure) {
    return res.status(503).json({
      status: 'UNHEALTHY',
      service: 'node-telemetry-fleet',
      error: 'Synthetic failure mode triggered via chaos endpoint',
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({
    status: 'HEALTHY',
    service: 'node-telemetry-fleet',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    uptimeHuman: getUptimeFormatted(uptimeSeconds),
    requestsProcessed: totalRequests,
    system: {
      hostname: os.hostname(),
      platform: process.platform,
      architecture: process.arch,
      nodeVersion: process.version
    },
    memory: {
      rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`
    }
  });
});
app.get('/api/metrics', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    processId: process.pid,
    cpuUsage: process.cpuUsage(),
    memoryBytes: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external
    },
    systemLoadAverage: os.loadavg()
  });
});
app.post('/api/chaos/toggle', (req, res) => {
  simulatedFailure = !simulatedFailure;
  res.json({
    chaosActive: simulatedFailure,
    statusReported: simulatedFailure ? 'UNHEALTHY (HTTP 503)' : 'HEALTHY (HTTP 200)'
  });
});
app.get('/', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
  const mem = process.memoryUsage();
  const heapUsagePercent = Math.min(100, Math.round((mem.heapUsed / mem.heapTotal) * 100));

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Node Telemetry Fleet | Ops Console</title>
      <style>
        :root {
          --bg: #090d16;
          --panel: #121826;
          --border: #222f44;
          --text: #e2e8f0;
          --muted: #8092a8;
          --accent: #38bdf8;
          --green: #22c55e;
          --red: #ef4444;
        }
* { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: var(--bg);
          color: var(--text);
          padding: 40px 20px;
          display: flex;
          justify-content: center;
        }
        .container { max-width: 820px; width: 100%; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 24px; }
        .tag { font-family: monospace; font-size: 0.8rem; background: #1e293b; padding: 4px 8px; border-radius: 4px; color: var(--accent); }
        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;
          background: ${simulatedFailure ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)'};
          color: ${simulatedFailure ? 'var(--red)' : 'var(--green)'};
          border: 1px solid ${simulatedFailure ? 'var(--red)' : 'var(--green)'};
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .card { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 20px; }
        .card-title { font-size: 0.75rem; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; font-weight: 600; }
        .card-metric { font-size: 1.6rem; font-weight: 700; color: #f8fafc; }
        .progress-bar { width: 100%; background: #1e293b; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 10px; }
        .progress-fill { height: 100%; background: var(--accent); width: ${heapUsagePercent}%; transition: width 0.3s ease; }
        .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
        .btn {
          text-decoration: none; font-size: 0.85rem; padding: 10px 18px; border-radius: 6px;
          border: 1px solid var(--border); background: var(--panel); color: var(--text); cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn:hover { border-color: var(--accent); }
        .btn-danger { border-color: var(--red); color: var(--red); }
        .terminal-box { background: #030712; border: 1px solid var(--border); border-radius: 6px; padding: 14px; font-family: monospace; font-size: 0.8rem; color: #38bdf8; }
      </style>
      <meta http-equiv="refresh" content="8">
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h2 style="margin-bottom: 4px;">Node Telemetry Fleet</h2>
            <span class="tag">HOST: ${os.hostname()}</span>
            <span class="tag">RUNTIME: Node ${process.version}</span>
          </div>
          <div class="badge">
            ● ${simulatedFailure ? 'SYSTEM UNHEALTHY' : 'ALL NODES HEALTHY'}
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Fleet Uptime</div>
            <div class="card-metric">${getUptimeFormatted(uptimeSeconds)}</div>
          </div>
          <div class="card">
            <div class="card-title">Heap Memory</div>
            <div class="card-metric">${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB</div>
            <div class="progress-bar"><div class="progress-fill"></div></div>
          </div>
          <div class="card">
            <div class="card-title">Total Requests</div>
            <div class="card-metric">${totalRequests}</div>
          </div>
          <div class="card">
            <div class="card-title">RSS Footprint</div>
            <div class="card-metric">${(mem.rss / 1024 / 1024).toFixed(1)} MB</div>
          </div>
        </div>

        <div class="actions">
          <a class="btn" href="/health" target="_blank">Query /health JSON ↗</a>
          <a class="btn" href="/api/metrics" target="_blank">Inspect /api/metrics ↗</a>
          <button class="btn btn-danger" onclick="fetch('/api/chaos/toggle', {method: 'POST'}).then(() => location.reload())">
            ${simulatedFailure ? 'Deactivate Chaos (Heal)' : 'Inject Chaos (Fail Healthcheck)'}
          </button>
        </div>

        <div class="terminal-box">
          [INFO] Process running on PID ${process.pid} bound to 0.0.0.0:${PORT}<br>
          [DIAG] Node platform: ${process.platform} (${process.arch})<br>
          [PROBE] Last health status response: ${simulatedFailure ? '503 Service Unavailable' : '200 OK'}
        </div>
      </div>
    </body>
    </html>
  `);
});

// Explicit 0.0.0.0 binding to allow Docker, bridge networks, and WSL2 port exposure
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[READY] Telemetry fleet engine running on http://0.0.0.0:${PORT}`);
});
