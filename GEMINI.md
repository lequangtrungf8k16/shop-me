# Shop-Me Project Context

This is the primary context file (`GEMINI.md`) for the `shop-me` project. It contains shared architectural patterns, technical stack details, and team conventions.

## 🏗️ Architecture
This is a full-stack project separated into a `frontend` and `backend` monorepo structure.

## 🛠️ Technology Stack

### Backend (`/backend`)
- **Runtime & Framework:** Node.js, Express 5, TypeScript (built with `tsup`, dev with `tsx`).
- **Database ORM:** Prisma (`@prisma/client`, `@prisma/adapter-mariadb`).
- **Caching & Realtime:** Redis, Socket.io.
- **Validation & Auth:** Zod, jsonwebtoken, bcryptjs.
- **Mailing:** Nodemailer with EJS templates.

### Frontend (`/frontend`)
- **Framework:** Next.js 16 (React 19).
- **Styling:** TailwindCSS v4.
- **State Management:** Zustand (Global State), React Query (Server State/Data Fetching).
- **Data Fetching:** Axios.
- **Icons & UI:** Lucide React, Sonner (Toasts).
- **Realtime:** socket.io-client.

## 📝 Conventions

### Context Management
- **`GEMINI.md` (Root):** For global project architecture, tech stack, and shared rules. (Tracked in Git).
- **`frontend/GEMINI.md` & `backend/GEMINI.md`:** For specific frontend/backend rules (if needed).
- **`C:\Users\KIEUNGUYEN\.gemini\tmp\shop-me\memory\MEMORY.md`:** For your private, machine-specific notes, current task progress, or uncommitted work.

### Code Style
- Use TypeScript strictly.
- **Backend:** Modular architecture (e.g., `modules/articles/article.service.ts`, `article.controller.ts`).
- **Frontend:** Component-based architecture.

## 🚀 Getting Started

*Note: Add specific commands here as needed.*
- Backend dev: `npm run dev` (in `/backend`)
- Frontend dev: `npm run dev` (in `/frontend`)
