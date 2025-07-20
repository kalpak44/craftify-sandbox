# 🛠️ Craftify Function Runtime

Minimalistic container-based runtime for isolated, event-driven execution of user-defined JavaScript handlers.

---

## 📦 Project Structure

```
.
├── Dockerfile             # Runtime container definition
├── package.json           # Declares ESM and bootstrap entry
├── bootstrap/             # Internal runtime logic (do not edit)
│   ├── context.js         # Provides `log` / `emit` / `env`
│   ├── main.js            # Runtime entrypoint (reads stdin, invokes user handler)
│   └── validator.js       # Ensures valid async handler
├── user/                  # User-defined function
│   └── handler.js           # Must export: async (event, context) => {}
├── build-push-run.sh      # Build, push, and run function container
├── README.md              # You're here :)
```

---

## 🧠 Concept

This project is a lightweight function runtime:

- **User writes logic in `user/handler.js`**
- **Backend builds image and wrap it with this template**
- **Event payload is sent via `stdin`**
- **Container runs in isolation and returns result via stdout**

> ✅ It is an Event-triggered function execution inside Kubernetes or Docker jobs template.

---

## ✍️ User Function Example

```js
// user/handler.js
export default async (event, context) => {
  const { user } = event.payload;
  context.log(\`Handling new user: \${user.name}\`);

  await context.emit('user.created', {
    email: user.email,
    name: user.name
  });
};
```