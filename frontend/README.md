# Cuckoo Frontend - React App

This is the React + Vite frontend interface for Cuckoo, the private WhatsApp broadcasting dashboard.

## 📦 Directory Structure

- `/src/pages`: Contains main pages including `WhatsAppPage.jsx` (which holds the onboarding guided UX and the Campaign Composer steps) and pages for campaigns, dashboard, FAQ, profile, and settings.
- `/src/components`: UI components such as Navbar, Modals, and toast notifications.
- `/src/context`: React context providers (e.g., `ToastContext`).
- `/src/services`: REST client modules targeting the Flask and Node.js backend endpoints.
- `/src/index.css`: Global styles, layout configurations, variables, and typography definitions.

## 🛠️ Key Scripts

- **`npm run dev`**: Starts the local Vite development server on port `5173`.
- **`npm run build`**: Compiles the assets, builds, and bundles the client production pages in `/dist`.
- **`npm run lint`**: Inspects static JS/JSX code for styling issues.

## ⚙️ Environment Variables

The client reads environment settings from CSS/JS parameters. By default:

- WhatsApp Socket & API services: `http://localhost:3001`
- Flask endpoints: `http://localhost:5000`
- Token verification headers: `VITE_WA_API_KEY`
