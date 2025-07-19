# Craftify – Function-first developer platform

Craftify is a modular platform for building, running, and managing user-defined functions triggered by HTTP requests or
event streams.

It helps you:

- Register functions from GitHub
- Trigger them via HTTP or Kafka-style events
- Run them as jobs or services
- View logs and invocations
- Manage deployment lifecycle (build, stop, deregister)

---

## 💡 Key Components

### 1. `frontend/` – React (Auth0)

Provides a simple interface to:

- Register functions (from GitHub repos)
- Choose execution mode (HTTP or Event, Job or Service)
- Monitor build & run status
- View logs, invocation history
- Toggle and deregister functions

---

### 2. `backend-bff/` – BFF API (Java/ Spring Boot)

- Authenticates users via Auth0
- Manages GitHub OAuth flow
- Provides UI APIs:
    - Register/enable/disable functions
    - Query build/run logs
    - Return real-time updates (WebSocket/SSE)

---

### 3. `events-producer-api/` – Event Entry Point (Java/ Spring Boot)

- Accepts app-level event submissions (via REST or Webhooks)
- Publishes events to Kafka (or Redis Streams in dev)
- Examples: `user.registered`, `file.uploaded`, etc.

---

### 4. `events-consumer-api/` – Event Router & Dispatcher (Java/ Spring Boot)

- Subscribes to Kafka topics
- Filters and matches events to user-registered functions
- Depending on mode:
    - Launches job containers (`docker run`)
    - Sends HTTP request to service-style containers
- Collects logs, results, and updates state

---

## 📁 Folder Structure

```text
craftify/
├── frontend/               # React UI
├── backend-bff/            # User-facing API & auth
├── events-producer-api/    # Emits events from frontend or 3rd parties
├── events-consumer-api/    # Listens to events and runs functions
├── wrappers/
│   ├── node-event-handler/ # Lightweight runner for event jobs
│   └── node-http-handler/  # HTTP wrapper for service functions
└── docs/                   # Research / Experiments
```
