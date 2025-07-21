# 🛠️ Craftify Function Runtime

A minimalistic, container-based runtime for isolated, event-driven execution of user-defined JavaScript handlers.

---

## 📦 Project Structure

```
.
├── Dockerfile                # Runtime container definition
├── package.json              # Declares ESM and bootstrap entry
├── bootstrap/                # Internal runtime logic (do not edit)
│   ├── context.js            # Provides `log`, `emit`, `env` for user functions
│   ├── main.js               # Entrypoint: reads stdin, invokes user handler
│   └── validator.js          # Ensures valid async handler export
├── user/                     # User-defined module
│   ├── handler.js            # Main handler (async function)
│   ├── module.json           # Module configuration (events, pages, menu)
│   └── pages/                # Optional: UI forms in Forminer JSON
│       └── product-registration.form.json
├── build-push-run.sh         # Build, push, and run helper script
├── README.md                 # This file
```

---

## 🧠 Concept

- Write business logic in `user/handler.js`
- Register events, forms, and menu in `user/module.json`
- Optionally design forms in `user/pages/` using Forminer JSON
- Backend builds image, runs in a container, and communicates via stdin/stdout

> **Event-driven:** Handlers are triggered by backend events (e.g., product registration).

---

## ✍️ User Handler Example

```js
// user/handler.js
export default async (event, context) => {
  const { productName, quantity, unit } = event.payload;
  context.log(`Registering new product: ${productName}, ${quantity} ${unit}`);

  await context.emit('product.created', {
    productName,
    quantity,
    unit
  });
};
```

---

## 📝 Module Example

```json
{
  "name": "Product Module",
  "description": "Handles product registration events.",
  "handlers": [
    {
      "eventType": "product.registration.submitted",
      "file": "handler.js",
      "function": "default"
    }
  ],
  "pages": [
    {
      "file": "pages/product-registration.form.json",
      "route": "/products/register",
      "menu": {
        "path": [
          { "id": "inventory", "label": "Inventory" },
          { "id": "products", "label": "Products" }
        ],
        "id": "registerProduct",
        "label": "Register Product",
        "order": 1,
        "icon": "Box"
      },
      "submitHandler": "handleProductRegister"
    }
  ]
}
```

---

## 🚀 Quickstart

1. Edit `user/handler.js` and `user/module.json` as needed.
2. Build and run with `./build-push-run.sh`
3. Send events via stdin to trigger your handler.

---