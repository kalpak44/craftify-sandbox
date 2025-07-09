# Flow Execution Platform - Overview

## Vision

The Flow Execution Platform is a developer-focused orchestration system that enables users to visually create, manage, and execute workflows composed of custom code steps. It combines secure multi-tenant data handling, step-level configuration, secrets management, and reactive extensibility—all wrapped in an intuitive UI with AI-assisted authoring.

The platform aims to empower developers to automate tasks, integrate APIs, and manage structured data through flows without building infrastructure from scratch.

---

## Architecture Components

### 1. Frontend (React + Auth0)

The UI provides all interfaces for interacting with flows, data, secrets, and files. Key features include:

- **Flow Editor**: DAG-based visual builder with per-step config (runtime, script, secrets).
- **Schema Designer**: JSON-based schema creation with form preview.
- **Secrets Manager**: Add, view, and attach masked secrets.
- **File Explorer**: Manage scripts/files from persistent storage.
- **Execution Viewer**: Live logs, retry failed steps, view statuses.
- **Auth0-based Authentication** for secure, scoped access.

### 2. Backend (Spring Boot)

Central orchestrator and API provider:

- **REST + WebSocket APIs** for flow, secrets, file, schema, and data operations.
- **Kubernetes Integration**: Deploys user flows as Pods/Jobs.
- **Secrets & Auth**: Injects JWTs, env vars, encrypted secrets.
- **Data Management**: CRUD for user records, validated against schemas.
- **Security**: Namespace isolation, short-lived tokens, JWT enforcement.


### ~~3. Flow Controller (K8s Sidecar)~~

~~A lightweight coordinator that:~~

- ~~Loads and parses flow DAGs.~~
- ~~Executes steps with conditional logic.~~
- ~~Shares volume between steps.~~
- ~~Reports status/logs and cleans up.~~

### 3. Function Controller
A lightweight execution orchestrator responsible for managing **function-based logic**, replacing the previous Flow Controller. It now **does not manage entire flows**, but rather:

- **Receives function execution requests** from the backend.
- **Invokes isolated functions** based on step metadata.
- **Monitors execution lifecycle**: success/failure, logs, and resource usage.
- **Delegates cleanup** and secret unmounting post execution.
- Operates per function unit—not entire DAG—offering better modularity and isolation.

> Note: This decoupling allows steps to be developed, tested, and deployed independently while still maintaining orchestration integrity.


### ~~4. Step Containers~~

~~Per-step execution environments:~~

- ~~Pre-built runtimes (Python, Node.js, Bash, etc.).~~
- ~~Mounted user PVC with scripts/config.~~
- ~~Receives secrets and tokens via env vars.~~
- ~~Securely calls internal APIs (Data API, utils).~~


### 4. Function Step Runners

These replace Step Containers with **language/runtime-specific function runners** optimized for single-purpose executions:

- **Encapsulated runtimes** (e.g., Python, Node.js, Bash).
- **Directly receive input payloads**, secrets, and tokenized configs via mounted volumes and env vars.
- **Executes single functions** stored in user volumes (PVCs).
- **Reports back execution status and logs** via WebSocket or API callbacks.
- **Stateless and short-lived**: spun up per invocation, improving security and auditability.


### 5. Data API

Internal-only CRUD service:

- JWT-authenticated.
- Scoped to individual user data.
- Validates against schemas.
- Used by step containers for record operations.

---

## Key Features

- **Live Logs & Retry**: Monitor and rerun specific flow steps.
- **Multi-Tenant Isolation**: Enforced at K8s and app level.
- **Secrets & Configs**: Managed per user, securely injected.
- **Reactive Triggers** (planned): Start flows via email, bots, APIs.
- **AI Assistant** (planned): Code autocomplete and suggestions.
- **Extensible Utility APIs**: Email, PDF generation, HTTP requests.

---

## Directory Structure Context

This platform lives in a monorepo with three main modules:

- `frontend/` – React UI for flow creation & data management.
- `backend/` – Spring Boot app exposing APIs and deploying executions.

---

## Future Ideas

- Reusable step library.
- Git-integrated flow versioning.
- Webhook receivers for third-party triggers.
- Test environments with mock data.
