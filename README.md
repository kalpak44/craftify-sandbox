# Craftify – Simple Overview

Craftify is a developer tool for building and running small pieces of code (functions) connected to forms, files, or events. It helps you:

- Design forms
- Write simple functions
- Run them on demand or automatically
- Track execution results

---

## Key Parts of the System

### 1. Frontend (React + Auth0)

The user interface lets you:

- Build forms and attach functions to them
- Write and configure code (functions)
- See past runs and logs
- Upload and manage files
- Log in securely using Auth0
- Use a simple JSON editor as a data editor
---

### 2. Backend (Java / Spring Boot)

Handles:

- APIs for forms, files, execution, and logs
- Queueing tasks when a function needs to run
- Communicating with file storage (S3/MinIO)
- Sending updates to the frontend (via WebSocket)

---

### 3. Function Controller

A small service that:

- Picks up queued tasks
- Starts function execution
- Watches for success or failure
- Saves logs and results

---

### 4. Function Runners

Tiny, short-lived services that:

- Run one function at a time (in Python, Node.js, Bash, etc.)
- Get inputs and secrets
- Send logs and results
- Shut down after finishing

---

### 5. Data Service

A private service that:

- Stores user data safely
- Is only accessible by system components

---

## How it Works (Example Flow)

1. User submits a form
2. Backend adds a task to the queue
3. Controller picks it up and runs the function
4. Runner executes the function and returns results
5. Frontend shows live status and logs

---

## Running It

- **Locally**: Use Docker or local Kubernetes
- **Cloud**: Deploy to AWS with EKS, S3, etc.
- **Queue**: Start with Redis or RabbitMQ; upgrade to Kafka/SQS later

---

## Folder Structure

craftify/
├── frontend/ # React UI
├── backend/ # Java backend
├── controller/ # Task scheduler