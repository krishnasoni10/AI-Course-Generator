# 3-Minute Project Introduction

"Hi, I'm the creator of the **AI Course Generator**, a full-stack web application designed to help users instantly generate structured learning paths on any topic. 

The core problem this project solves is the massive time and effort required to curate a curriculum from scratch. With this tool, a user simply inputs a topic, their experience level, and desired course duration. The system leverages **Google's Gemini AI** to return a structured course layout, complete with chapters, objectives, quizzes, and optional YouTube video resources.

**How it works technically:**
The frontend is a Single Page Application built with **React and Vite**, styled using **Tailwind CSS** and **Shadcn UI** components for a clean, responsive experience. I handle routing via React Router and manage global authentication state using React Context. 

When a user creates a course, the frontend sends a prompt to my **Node.js and Express backend**. The backend acts as a secure proxy to the Gemini API. A crucial part of the backend is the normalization logic—it sanitizes the somewhat unpredictable AI responses into a strict JSON structure and persists it to **MongoDB** using Mongoose. For authentication, I implemented a custom JWT strategy alongside Google OAuth to reduce friction during sign-up.

**Key Design Decisions:**
One major design decision was how to store the course data. Since a course contains many chapters, and chapters contain highly nested content blocks (like readings, code examples, and quizzes), I opted for a **Document-oriented NoSQL database (MongoDB)**. It perfectly maps to the JSON structure returned by the AI, avoiding complex relational joins and making reads extremely fast for the learner view.

**Current State & Future:**
Right now, the project is a fully functional MVP deployed on Vercel (frontend) and Render (backend). It successfully handles the end-to-end flow from generation to PDF export. However, I recognize some technical debt. For instance, while the frontend handles AI generation delays with loading states, moving the AI generation to a background queue (like Redis/BullMQ) and using WebSockets would significantly improve the user experience for long-running tasks. Additionally, extracting the complex AI parser logic into a separate service and expanding test coverage would be my immediate next steps for production readiness."
