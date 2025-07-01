# Craftify UI - React Vite Project

This project is the frontend user interface for the Craftify API platform.

## Prerequisites

- Node.js (v16.x or higher recommended)
- npm (v8.x or higher) or yarn
- A modern web browser

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values (e.g., Auth0 domain, client ID, API URL).

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173)

## Useful Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run linter

## Environment Variables

Create a `.env` file in the project root. Example:
```env
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_API_URL=http://localhost:8080
```

## Troubleshooting
- Make sure the backend API is running and accessible at the URL specified in your `.env`.
- For Auth0 integration, ensure callback/logout/web origins in your Auth0 dashboard match `http://localhost:5173`.
- For backend API documentation, see [http://localhost:8080/swagger-ui](http://localhost:8080/swagger-ui) when the backend is running.

---

For more information, see the main [Craftify API README](../README.md).