# Project Overview: AI Course Generator

## Product Understanding
**Problem Solved:** Generating structured learning materials quickly. It automates the process of creating course outlines, chapter content, quizzes, and finding relevant videos.
**Users:** Learners or educators who need structured learning paths based on specific topics.
**User Journey:**
1. Sign up/Login (Google OAuth or custom JWT).
2. Enter course requirements (topic, category, level, duration).
3. The app generates an AI-powered course outline.
4. The user can edit the generated outline.
5. The user generates detailed content for individual chapters, which also fetches YouTube videos.
6. The user views the course in a learner interface and can export the notes to PDF.
**Maturity Level:** Early-stage MVP / Portfolio Project. The core features (auth, generation, database saving) exist and work well, but there are areas missing for full production scale (e.g., background job processing for long-running AI tasks, automated test coverage).

## System Understanding
**Major Components:**
- **Frontend:** React application built with Vite, Tailwind CSS, Shadcn/Radix UI for components.
- **Backend:** Node.js/Express application.
- **Database:** MongoDB via Mongoose.
- **External APIs:** Google Gemini for content generation, YouTube Data API for video lookup.

**Data Flow:**
1. Frontend makes REST API calls to the Express backend.
2. Backend validates authentication using custom JWT middleware.
3. For AI generation, the backend proxies requests to Google Gemini, heavily normalizes the text responses, and returns them to the frontend.
4. For course saving, the backend persists the layout to MongoDB and ties it to the user's email address.
5. Frontend maintains authentication state (`AuthContext`) and UI flow using React Router.

**Architecture & Decisions:**
- The frontend uses `import.meta.env` for config, leveraging Vite's environment system.
- Authentication uses a dual strategy: custom JWT (bcrypt) and Google OAuth (`@react-oauth/google`), providing fallback options.
- The backend actively normalizes text content from the AI to ensure consistent structure (using utilities like `compactText`, `normalizeList` in `CourseRouter.js`), indicating the unpredictable nature of LLM responses.
- Database models (e.g., `CourseModel.js`) are heavily nested (schemas within schemas) to store the complex AI output in a single document, optimizing for fast read times.
