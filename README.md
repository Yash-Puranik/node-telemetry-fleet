# node-telemetry-fleet

> A production-grade, containerized Node.js telemetry and health monitoring microservice featuring real-time observability probes, chaos fault-injection, rootless Alpine containerization, and automated CI/CD.

---

## Features

- **Observability Endpoints:** Active `/health` probes, real-time memory/CPU `/api/metrics`, and an integrated operational dashboard.
- **Chaos Engineering:** In-memory fault toggle (`/api/chaos/toggle`) to simulate service degradation and test orchestrator recovery.
- **Hardened Containerization:** Minimal `node:20-alpine` footprint, unprivileged user execution (`USER node`), and optimized layer caching.
- **Deterministic Builds:** Pinned dependencies managed via `npm ci` with automated cache clearing to prevent image bloat.
- **Resource Guardrails:** Pre-configured CPU (`0.50`) and memory (`256M`) hard limits, log rotation, and network isolation via Docker Compose.
- **Automated CI Pipeline:** GitHub Actions workflow validating builds, container spin-up, and automated health checks on `main` and `test` branches.

---

## API & Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status probe (returns `200 OK` or `503 Service Unavailable`) |
| `GET` | `/api/metrics` | System telemetry (memory usage, event loop latency, uptime, process info) |
| `POST` | `/api/chaos/toggle` | Toggles simulated failure mode to test alerting and container healthchecks |
| `GET` | `/` | Operational dark-mode status dashboard |

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/) (v2+)
- [Node.js](https://nodejs.org/) (v20+ for local development)

### Local Development

1. Install dependencies:
   ```bash
   npm install
