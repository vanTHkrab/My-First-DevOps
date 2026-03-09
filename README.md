<p align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" />
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" />
  <img src="https://img.shields.io/badge/GitLab-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white" />
</p>

# My-First-DevOps

> A full-stack **DevOps learning project** featuring a real-time chat application deployed with Docker, reverse-proxied through Nginx with SSL, monitored via Grafana/Prometheus/Loki, and version-controlled with a self-hosted GitLab instance — all running on a single VPS.

---

## Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Docker Network Topology](#-docker-network-topology)
- [Services Breakdown](#-services-breakdown)
  - [Web Application Stack](#-web-application-stack)
  - [Monitoring Stack](#-monitoring-stack)
  - [GitLab (CI/CD)](#-gitlab-cicd)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Network & Port Mapping](#-network--port-mapping)
- [Monitoring & Observability](#-monitoring--observability)
- [SSL / HTTPS](#-ssl--https)
- [Useful Commands](#-useful-commands)
- [Lessons Learned](#-lessons-learned)
- [License](#-license)

---

## Architecture Overview

```
                        ┌─────────────────────────────────────────────────────────┐
                        │                      INTERNET                           │
                        └────────────────────────┬────────────────────────────────┘
                                                 │
                                          :80 / :443
                                                 │
                    ┌────────────────────────────▼────────────────────────────────┐
                    │                    Nginx (Reverse Proxy)                     │
                    │            SSL termination · Load balancing                  │
                    │       /           → client:3000 (Next.js)                    │
                    │       /api/*      → server:3001 (NestJS)                     │
                    │       /socket.io/ → server:3001 (WebSocket)                  │
                    └───────┬────────────────────┬────────────────────────────────┘
                            │                    │
                 ┌──────────▼──────┐  ┌──────────▼──────────┐
                 │   Client        │  │   Server             │
                 │   Next.js 16    │  │   NestJS 11          │
                 │   React 19      │  │   Socket.IO          │
                 │   Tailwind CSS  │  │   ValidationPipe     │
                 │   :3000         │  │   :3001              │
                 └─────────────────┘  └───────┬──────┬───────┘
                                              │      │
                                   ┌──────────▼──┐ ┌─▼──────────┐
                                   │ PostgreSQL  │ │   Redis     │
                                   │ :5432       │ │   :6379     │
                                   └─────────────┘ └─────────────┘

         ┌─────────────────────────── Monitoring Stack ───────────────────────────┐
         │  Prometheus (:9090)  ←── Node Exporter (:9100)                         │
         │                     ←── cAdvisor (:8081)                               │
         │  Loki (:3100)       ←── Promtail (Docker log discovery)                │
         │  OpenSearch (:9200) ←── Fluent Bit (system + nginx logs)               │
         │  Grafana (:3000)    ←── Prometheus / Loki / OpenSearch datasources     │
         └────────────────────────────────────────────────────────────────────────┘

         ┌───────────────────── GitLab CE (Self-Hosted) ──────────────────────────┐
         │  HTTP  :8080  │  HTTPS  :8443  │  SSH  :2222                           │
         └────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
.
├── README.md
├── gitlab/                         # Self-hosted GitLab CE
│   └── docker-compose.yml
├── monitoring-stack/               # Observability & logging
│   ├── docker-compose.yml
│   ├── fluent-bit.conf             # Log collector → OpenSearch
│   ├── prometheus.yml              # Metrics scrape config
│   └── promtail/
│       └── promtail-config.yaml    # Docker log discovery → Loki
└── web-application/                # Main application stack
    ├── docker-compose.yml
    ├── nginx/
    │   └── nginx.conf              # Reverse proxy + SSL termination
    ├── html/
    │   └── index.html              # Static fallback page
    ├── clients/                    # Next.js 16 frontend
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── app/                # App Router (layout, page, globals)
    │       ├── components/         # UI components (chat, buttons)
    │       ├── context/            # Socket.IO context provider
    │       ├── hooks/              # Custom hooks (useApi)
    │       ├── actions/            # Server actions
    │       └── types/              # TypeScript definitions
    └── server/                     # NestJS 11 backend
        ├── Dockerfile
        ├── package.json
        └── src/
            ├── main.ts             # Bootstrap (port 3001, CORS, validation)
            ├── app.module.ts       # Root module
            ├── chat/               # WebSocket chat gateway + DTOs
            └── health/             # Health check endpoint (/health)
```

---

## Tech Stack

| Layer              | Technology                          | Purpose                            |
|--------------------|-------------------------------------|------------------------------------|
| **Frontend**       | Next.js 16, React 19, Tailwind CSS  | SSR/CSR web client                 |
| **Backend**        | NestJS 11, Socket.IO                | REST API + real-time WebSocket     |
| **Database**       | PostgreSQL 17                       | Persistent relational data store   |
| **Cache**          | Redis 7                             | In-memory caching / session store  |
| **Reverse Proxy**  | Nginx (Alpine)                      | SSL termination, routing, LB       |
| **Containerization** | Docker, Docker Compose            | Service orchestration              |
| **Metrics**        | Prometheus, Node Exporter, cAdvisor | System & container metrics         |
| **Logging**        | Loki + Promtail, Fluent Bit + OpenSearch | Log aggregation pipelines    |
| **Dashboards**     | Grafana                             | Unified observability UI           |
| **CI/CD**          | GitLab CE (self-hosted)             | Source control & pipelines         |
| **Package Manager** | pnpm                               | Fast, disk-efficient dependency management |

---

## Docker Network Topology

This project uses **isolated bridge networks** with an **external shared network** for cross-stack communication — following the principle of least privilege for inter-service access.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          shared_network (external)                    │
│                                                                      │
│   Bridges communication between ALL three Docker Compose stacks:     │
│   web-application  ←→  monitoring-stack  ←→  gitlab                  │
│                                                                      │
│   Services on this network:                                          │
│   • nginx, client, server  (web-application)                         │
│   • loki, promtail         (monitoring-stack)                        │
│   • gitlab                 (gitlab)                                  │
└──────────────────────────────────────────────────────────────────────┘

┌─── web-application ──────────────────────────────────────────────────┐
│                                                                      │
│  frontend_net ─── nginx ←→ client                                    │
│                                                                      │
│  local_net    ─── nginx ←→ client ←→ server                          │
│                                                                      │
│  backend_net  ─── server ←→ db (PostgreSQL) ←→ redis                 │
│                                                                      │
│  shared_net   ─── nginx, client, server  ──→ (external bridge)       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─── monitoring-stack ─────────────────────────────────────────────────┐
│                                                                      │
│  monitor_net  ─── prometheus, grafana, opensearch, node-exporter,    │
│                   fluent-bit, cadvisor, loki, promtail               │
│                                                                      │
│  shared_net   ─── loki, promtail  ──→ (external bridge)              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─── gitlab ───────────────────────────────────────────────────────────┐
│                                                                      │
│  gitlab_net   ─── gitlab                                             │
│                                                                      │
│  shared_net   ─── gitlab  ──→ (external bridge)                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Network Isolation Strategy

| Network              | Scope            | Purpose                                              |
|----------------------|------------------|------------------------------------------------------|
| `project_frontend_net` | web-application | Isolate Nginx ↔ Client traffic                       |
| `project_backend_net`  | web-application | Isolate Server ↔ DB ↔ Redis (no frontend access)     |
| `project_local_net`    | web-application | Internal routing: Nginx → Client → Server            |
| `monitor_net`          | monitoring-stack | All monitoring services communicate internally       |
| `gitlab_net`           | gitlab           | GitLab internal network                              |
| `shared_network`       | **cross-stack**  | External bridge for inter-stack communication         |

> **Why?** Database and Redis are **never** exposed to the frontend network. Monitoring tools can reach application logs via the shared network without being on the same bridge as the database.

---

## Services Breakdown

### Web Application Stack

| Service      | Image               | Internal Port | Exposed Port | Networks                                    |
|--------------|----------------------|:------------:|:------------:|---------------------------------------------|
| **nginx**    | `nginx:alpine`       | 80 / 443     | `80` / `443` | frontend_net, shared_net, local_net          |
| **client**   | Custom (Node 24)     | 3000         | —            | frontend_net, shared_net, local_net          |
| **server**   | Custom (Node 24)     | 3001         | —            | local_net, backend_net, shared_net           |
| **db**       | `postgres:17-alpine` | 5432         | —            | backend_net                                  |
| **redis**    | `redis:7-alpine`     | 6379         | —            | backend_net                                  |

**Key features:**
- Health checks on `db` and `redis` with retry logic
- Named volumes for data persistence (`postgres_data`, `redis_data`)
- pnpm store volumes to speed up rebuilds
- Bind-mounted log directories for external log collection
- Dependency ordering with `depends_on` + `condition`

### Monitoring Stack

| Service           | Image                              | Exposed Port | Purpose                         |
|-------------------|-------------------------------------|:------------:|---------------------------------|
| **Prometheus**    | `prom/prometheus:latest`            | `9090`       | Metrics collection & alerting   |
| **Grafana**       | `grafana/grafana:latest`            | `3000`       | Visualization dashboards        |
| **Node Exporter** | `prom/node-exporter:latest`         | `9100`       | Host-level metrics              |
| **cAdvisor**      | `ghcr.io/google/cadvisor:latest`    | `8081`       | Container resource metrics      |
| **OpenSearch**    | `opensearchproject/opensearch:latest` | `9200`     | Full-text log search & indexing |
| **Fluent Bit**    | `fluent/fluent-bit:latest`          | —            | Log shipping → OpenSearch       |
| **Loki**          | `grafana/loki:latest`               | `3100`       | Log aggregation (label-based)   |
| **Promtail**      | `grafana/promtail:latest`           | —            | Docker log discovery → Loki     |

**Observability pipelines:**

```
Pipeline 1 (Metrics):
  Node Exporter ──┐
  cAdvisor ───────┤──→ Prometheus ──→ Grafana
                  │
Pipeline 2 (Logs - structured):
  Docker containers ──→ Promtail ──→ Loki ──→ Grafana

Pipeline 3 (Logs - system/nginx):
  systemd journal ──┐
  nginx access.log ─┤──→ Fluent Bit ──→ OpenSearch ──→ Grafana
  nginx error.log  ─┘
```

### GitLab (CI/CD)

| Service    | Image                     | Ports                        |
|------------|---------------------------|------------------------------|
| **GitLab** | `gitlab/gitlab-ce:latest` | `8080` (HTTP), `8443` (HTTPS), `2222` (SSH) |

- Self-hosted GitLab Community Edition
- Configured with custom SSH port (`2222`) to avoid host SSH conflict
- Connected to `shared_network` for potential CI runner ↔ app integration

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24.x
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.x (V2 plugin)
- A VPS or local machine with at least **4 GB RAM** (GitLab alone needs ~2 GB)
- (Optional) Domain name with DNS pointing to your server for SSL

### 1. Create the Shared Network

All three stacks communicate through an external Docker network. Create it **once** before starting any stack:

```bash
docker network create shared_network
```

### 2. Start the Web Application

```bash
cd web-application

# Copy and edit the Nginx config
cp nginx/nginx.conf.example nginx/nginx.conf
# Edit nginx.conf with your domain / IP

# Build and start all services
docker compose up -d --build
```

### 3. Start the Monitoring Stack

```bash
cd monitoring-stack
docker compose up -d
```

### 4. Start GitLab (Optional)

```bash
cd gitlab
docker compose up -d
```

> GitLab takes **3–5 minutes** to fully initialize on first boot. Check logs with `docker logs -f gitlab`.

### 5. Verify Everything is Running

```bash
# Check all containers across stacks
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test the application health endpoint
curl -k https://your-domain/api/health
# Expected: {"status":"ok"}
```

---

## ⚙️ Environment Variables

### Web Application — Server

| Variable        | Default                                      | Description              |
|-----------------|----------------------------------------------|--------------------------|
| `NODE_ENV`      | `development`                                | Runtime environment      |
| `PORT`          | `3001`                                       | NestJS listen port       |
| `DATABASE_URL`  | `postgresql://postgres:password@db:5432/nestdb` | PostgreSQL connection |
| `REDIS_URL`     | `redis://redis:6379`                         | Redis connection         |

### Web Application — Client

| Variable                  | Default                   | Description               |
|---------------------------|---------------------------|---------------------------|
| `NODE_ENV`                | `development`             | Runtime environment       |
| `NEXT_PUBLIC_API_URL`     | `http://server:3000`      | Backend API base URL      |
| `NEXT_TELEMETRY_DISABLED` | `1`                       | Disable Next.js telemetry |

### Monitoring — Grafana

| Variable                    | Default | Description             |
|-----------------------------|---------|-------------------------|
| `GF_SECURITY_ADMIN_PASSWORD` | `admin` | Grafana admin password  |

---

## 🔌 Network & Port Mapping

| Port  | Service        | Protocol     | Access     |
|:-----:|----------------|:------------|:-----------|
| `80`  | Nginx          | HTTP         | Public     |
| `443` | Nginx          | HTTPS (SSL)  | Public     |
| `3000`| Grafana        | HTTP         | Internal*  |
| `3100`| Loki           | HTTP         | Internal   |
| `8080`| GitLab (HTTP)  | HTTP         | Internal*  |
| `8081`| cAdvisor       | HTTP         | Internal   |
| `8443`| GitLab (HTTPS) | HTTPS        | Internal*  |
| `9090`| Prometheus     | HTTP         | Internal   |
| `9100`| Node Exporter  | HTTP         | Internal   |
| `9200`| OpenSearch     | HTTP         | Internal   |
| `2222`| GitLab (SSH)   | SSH          | Internal*  |

> \* Consider firewall rules (e.g., `ufw`) to restrict access to internal ports in production.

---

## Monitoring & Observability

### Grafana Datasources to Configure

| Datasource  | Type         | URL                        |
|-------------|--------------|----------------------------|
| Prometheus  | Prometheus   | `http://prometheus:9090`   |
| Loki        | Loki         | `http://loki:3100`         |
| OpenSearch  | OpenSearch   | `http://opensearch:9200`   |

### Recommended Dashboards

1. **Node Exporter Full** — Host CPU, memory, disk, network (`ID: 1860`)
2. **Docker Container Monitoring** — cAdvisor metrics (`ID: 193`)
3. **Loki Log Viewer** — Real-time container logs
4. **Custom Nginx Dashboard** — Request rates, error codes from OpenSearch

### Prometheus Scrape Targets

```yaml
- prometheus  →  localhost:9090
- node-exporter  →  node-exporter:9100
- cadvisor  →  cadvisor:8080
```

---

## SSL / HTTPS

This project uses **Let's Encrypt** certificates mounted read-only into the Nginx container:

```
/etc/letsencrypt/live/<your-domain>/fullchain.pem
/etc/letsencrypt/live/<your-domain>/privkey.pem
```

Nginx is configured with:
- **HTTP → HTTPS redirect** (port 80 → 301 → port 443)
- **TLS 1.2 / 1.3** only
- **Server cipher preference** enabled

To generate certificates:

```bash
# Install certbot
sudo apt install certbot

# Generate certificate (standalone mode — stop nginx first)
sudo certbot certonly --standalone -d your-domain.com

# Or use webroot if nginx is running
sudo certbot certonly --webroot -w /var/www/html -d your-domain.com
```

---

## 🛠 Useful Commands

```bash
# ─── Docker Compose ──────────────────────────────────────────────────
docker compose up -d --build          # Build & start in background
docker compose down                   # Stop & remove containers
docker compose logs -f server         # Follow specific service logs
docker compose ps                     # List running services
docker compose restart nginx          # Restart single service

# ─── Network Inspection ──────────────────────────────────────────────
docker network ls                     # List all networks
docker network inspect shared_network # Inspect shared bridge
docker network inspect project_backend_net  # Check backend isolation

# ─── Container Debugging ─────────────────────────────────────────────
docker exec -it <container> sh        # Shell into container
docker stats                          # Real-time resource usage
docker logs --tail 100 -f <container> # Last 100 lines + follow

# ─── Database ────────────────────────────────────────────────────────
docker exec -it <db-container> psql -U postgres -d nestdb

# ─── Redis ───────────────────────────────────────────────────────────
docker exec -it <redis-container> redis-cli ping

# ─── Volumes ─────────────────────────────────────────────────────────
docker volume ls                      # List all volumes
docker volume inspect postgres_data   # Inspect specific volume
```

---

## Lessons Learned

This project was built as a hands-on DevOps learning exercise. Key takeaways:

| #  | Topic                      | What I Learned                                                             |
|----|----------------------------|---------------------------------------------------------------------------|
| 1  | **Network Isolation**       | Splitting networks (frontend/backend/shared) prevents unintended access between services |
| 2  | **External Networks**       | Using `external: true` lets separate Compose stacks communicate through a shared bridge |
| 3  | **Health Checks**           | `depends_on` with `condition: service_healthy` ensures proper startup ordering |
| 4  | **Reverse Proxy**           | Nginx as a single entry point simplifies SSL, routing, and WebSocket upgrades |
| 5  | **Log Aggregation**         | Running two log pipelines (Loki + OpenSearch) covers both structured and full-text search needs |
| 6  | **Container Metrics**       | cAdvisor + Prometheus gives deep visibility into per-container resource consumption |
| 7  | **Bind Mounts vs Volumes**  | Named volumes for data persistence, bind mounts for config files and log collection |
| 8  | **Self-Hosted GitLab**      | Running your own GitLab CE is resource-heavy (~2 GB RAM) but gives full control over CI/CD |
| 9  | **Docker Compose V2**       | `docker compose` (V2 plugin) replaces the legacy `docker-compose` binary |
| 10 | **SSL with Let's Encrypt**  | Free HTTPS with auto-renewal via certbot is production-ready |

---

## 📄 License

This project is for **educational purposes**. Feel free to fork, modify, and learn from it.

---

<p align="center">
  <sub>Built with ☕ and curiosity — learning DevOps one container at a time.</sub>
</p>
