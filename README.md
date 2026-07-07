# AI Course Generator

An AI-powered full-stack web application that turns a user topic into a structured course outline, chapter notes, optional YouTube video resources, and downloadable lesson PDFs.

## Live Demo

- Frontend: https://ai-course-generator-tan.vercel.app/
- Backend: https://ai-course-generator-si9d.onrender.com

## Tech Stack

Frontend:
- React with Vite
- Tailwind CSS
- Shadcn/Radix UI components
- React Router
- jsPDF and html2canvas for PDF export

Backend:
- Node.js and Express
- MongoDB with Mongoose
- JWT authentication with bcrypt password hashing
- Google Gemini for course and chapter generation
- YouTube Data API for video lookup

## Current Architecture

```text
frontend/
  src/
    App.jsx                         Route definitions
    auth/                           Login and signup screens
    dashboard/                      User dashboard and saved courses
    create-course/                  Course creation and editing flow
    course/[courseId]/start/        Learner view and PDF export
    lib/api.js                      Shared API helper

backend/
  index.js                          Express app entry
  Routes/                           Auth, AI, and course routes
  Controllers/                      Auth, Gemini, and YouTube handlers
  Models/                           MongoDB connection and schemas
  Middlewares/                      Request validation
```

## Main Flow

1. User signs up or logs in.
2. User creates a course by choosing category, topic, level, duration, and chapter count.
3. Frontend sends a structured prompt to `/ai/generate-course`.
4. Backend calls Gemini and returns a course layout.
5. Frontend saves the layout through `/course/save`.
6. User can edit the course/chapter outline.
7. User generates chapter content through `/ai/generate-chapter`.
8. Optional YouTube videos are fetched through `/ai/get-videos`.
9. Chapter content is saved to MongoDB and displayed in the learner view.
10. User can download chapter notes as a PDF.

## Backend Environment Variables

Set these in `backend/.env` locally and in Render for deployment:

```env
PORT=8080
MONGO_CONN=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
NODE_GEMINI_API_KEY=your_gemini_course_layout_key
NODE_GEMINI_API_KEY_2=your_gemini_chapter_content_key
NODE_YOUTUBE_API_KEY=your_youtube_data_api_key
```

## Frontend Environment Variables

Set this in `frontend/.env` locally and in Vercel for deployment:

```env
VITE_API_BASE_URL=https://ai-course-generator-m9bh.onrender.com
```

## API Summary

Auth:
- `POST /auth/signup`
- `POST /auth/login`

AI:
- `POST /ai/generate-course`
- `POST /ai/generate-chapter`
- `GET /ai/get-videos?q=search+query`

Courses:
- `GET /course?createdBy=user@example.com`
- `POST /course/save`
- `GET /course/:courseId`
- `PUT /course/update/:courseId`
- `POST /course/save-chapter-content`

## Deployment

Backend on Render:
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

Frontend on Vercel:
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

## Completed Features

- Signup and login
- AI-generated course outline
- Course saving in MongoDB
- Saved-course dashboard listing
- Editable course title, description, and chapters
- Chapter content generation
- Optional YouTube video resources
- Learner view with sidebar navigation
- Lesson PDF download
- Shared frontend API helper

## Next Improvements

- Add protected backend routes using JWT verification middleware.
- Add richer lesson blocks such as objectives, readings, and MCQs.
- Add per-chapter retry controls.
- Add automated tests for auth, course save, and AI response normalization.
