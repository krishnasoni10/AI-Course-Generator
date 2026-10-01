# Technical Q&A

### 1. Product Problem and Scope
**Q: What is the specific problem you are solving, and why did you choose this scope for the MVP?**
- **Decision:** The MVP focuses strictly on generating and displaying course material based on a single topic prompt, rather than branching out into collaborative editing or progress tracking.
- **Context:** The goal was to prove the core utility—structuring raw AI knowledge into a consumable format.
- **Trade-off:** We lack user analytics or progress tracking, but this allowed for a much faster shipping cycle.
- **Validation:** Successful course generations and the ability to export to PDF validate the core value proposition.

### 2. High-Level Architecture
**Q: Why did you choose a decoupled React Single-Page Application (SPA) and an Express backend instead of a full-stack framework like Next.js?**
- **Decision:** I chose a Vite-React SPA talking to an Express API.
- **Context:** I wanted clear separation of concerns between the client and the API, especially since the API needs to handle heavy AI prompting and data normalization independently.
- **Trade-off:** Next.js would have provided SSR and simpler routing, but a separate Express backend gives more flexibility if I want to build a mobile app later.

### 3. Major Technology Choice
**Q: Why did you choose Google Gemini over OpenAI's GPT for content generation?**
- **Decision:** The project uses the `@google/genai` SDK.
- **Context:** Gemini offers competitive pricing and strong structural JSON output capabilities, which are crucial for the course layouts.
- **Trade-off:** We are tightly coupled to Gemini's specific API limits and prompting quirks. 
- **Alternative:** OpenAI GPT-4o mini could be a drop-in replacement if abstracted properly via an interface.

### 4. Data Model
**Q: Your `CourseModel` has heavily nested subdocuments (e.g., chapters, content blocks, readings, quizzes). Why not normalize this into separate collections?**
- **Decision:** The entire course is stored as a single MongoDB document.
- **Context:** Courses are read-heavy and usually retrieved in their entirety when a user opens the learner view.
- **Why it was reasonable:** MongoDB handles nested arrays well, and this avoids complex joins.
- **Trade-off:** Updating a single quiz question requires modifying the whole course document.
- **Redesign:** If courses become massive or collaboratively edited, separating chapters into their own collection with references would be necessary.

### 5. API Interface Design
**Q: How do you handle the unpredictable nature of AI responses in your API?**
- **Decision:** The Express backend includes custom normalization functions (`compactText`, `normalizeList`, `normalizeQuiz`) in `CourseRouter.js` before saving to the database.
- **Context:** LLMs sometimes return malformed JSON or markdown artifacts (like `_QQ_MARK_`).
- **Why it was reasonable:** Sanitizing on the backend ensures the database only stores clean data, preventing frontend crashes when rendering.

### 6. Authentication and Authorization
**Q: How are you securing the API routes?**
- **Decision:** I implemented a custom JWT middleware (`AuthMiddleware.js`) and Google OAuth.
- **Context:** Routes like `/course/save` and `/course/:courseId` require a valid JWT token.
- **Trade-off:** Standard JWTs are stateless and hard to revoke before expiration.
- **Redesign:** Implementing refresh tokens and a Redis blocklist would be the production-ready approach for session management.

### 7. Reliability and Failure Handling
**Q: What happens if the AI API fails halfway through generating a course?**
- **Decision:** The backend catches the error and returns a 500 status. The frontend alerts the user via a toast notification (using `sonner`).
- **Context:** Synchronous API calls to LLMs can timeout easily.
- **Technical Debt:** Currently, there is no automatic retry mechanism for failed chapter generation. 
- **Redesign:** Moving AI generation to a background queue (like BullMQ) and notifying the client via Server-Sent Events (SSE) or WebSockets.

### 8. Performance
**Q: How do you handle the performance bottleneck of waiting for Gemini to generate content?**
- **Decision:** The user interface shows a loading state (spinner/progress) while waiting for the HTTP request to complete.
- **Context:** LLM generation is inherently slow.
- **Trade-off:** The user has to keep the browser tab open and wait synchronously.
- **Improvement:** Streaming the AI response directly to the client (using Server-Sent Events) would vastly improve perceived performance.

### 9. Scalability
**Q: If your user base grows 100x overnight, what breaks first?**
- **Decision:** The system currently relies on synchronous Express routes and a single MongoDB instance.
- **Context:** The biggest bottleneck is the Gemini API rate limits, followed by Node.js thread blocking if the normalization logic becomes too heavy.
- **Trigger for Redesign:** Hitting AI API rate limits or seeing frequent request timeouts on the backend.

### 10. Concurrency or Consistency
**Q: What happens if a user tries to edit the same course from two different devices simultaneously?**
- **Decision:** The system currently uses a "last write wins" approach on the `PUT /course/update/:courseId` route.
- **Context:** The app is designed for single-user generation.
- **Trade-off:** Data could be overwritten if multiple sessions are active.
- **Alternatives:** Implementing optimistic concurrency control using a version field (`__v`) in Mongoose.

### 11. Security
**Q: How do you prevent users from accessing or modifying courses they didn't create?**
- **Decision:** The backend queries always include `createdBy: req.user.email.toLowerCase()`.
- **Context:** The JWT payload contains the user's email, ensuring they can only fetch and update their own courses.
- **Trade-off:** Using email as the primary relational key instead of an immutable User ID (`_id`) can break if a user wants to change their email address later.

### 12. Testing
**Q: The README mentions testing as a "Next Improvement". How would you approach testing this application?**
- **Decision:** Testing is currently manual.
- **Context:** Fast iteration was prioritized over test coverage for the MVP.
- **Redesign:** I would introduce Jest/Supertest for API endpoint validation (especially to unit test the AI normalization logic in `CourseRouter.js`) and Playwright for the critical path: Login -> Generate Course -> View Course.

### 13. Deployment
**Q: Why did you choose Vercel for the frontend and Render for the backend?**
- **Decision:** Split deployment across two platforms.
- **Context:** Vercel offers seamless CI/CD and edge caching for Vite/React apps, while Render provides an easy environment for Node.js servers.
- **Trade-off:** Dealing with CORS and different environment variable management platforms. 
- **Alternatives:** Deploying both in a single AWS environment (e.g., ECS or Elastic Beanstalk) would reduce latency between frontend and backend.

### 14. Observability
**Q: How do you track errors in production?**
- **Decision:** The app currently relies on `console.error` and Render's default log streaming.
- **Context:** It’s sufficient for an early-stage project.
- **Trigger for Redesign:** Unreported user-facing errors or silently failing AI generations.
- **Improvement:** Integrating Sentry for frontend/backend error tracking and DataDog for API latency monitoring.

### 15. External-Service Dependency
**Q: Your app heavily depends on the YouTube Data API. How do you handle quotas?**
- **Decision:** Videos are fetched on demand when generating chapter content.
- **Context:** The YouTube API has strict daily quota limits.
- **Trade-off:** If the quota is exceeded, the course generates without videos, which degrades the experience.
- **Improvement:** Implementing a caching layer (Redis or MongoDB) to store YouTube search results for common queries would drastically reduce API calls.

### 16. Most Important Trade-off
**Q: What was the single biggest trade-off you made in this project?**
- **Decision:** Storing the entire course structure in a single database operation rather than generating it incrementally.
- **Context:** It keeps the UI simple and the database operations minimal.
- **Trade-off:** It forces the user to wait a long time upfront, and if the generation fails halfway, they might lose context. 
- **Alternatives:** Implementing a streaming UI where chapters appear one by one and are saved incrementally.

### 17. Technical Debt
**Q: What is the most pressing piece of technical debt in your codebase?**
- **Decision:** The AI response normalization logic in `CourseRouter.js` is quite complex and mixed directly with routing concerns.
- **Context:** It grew organically as edge cases from Gemini's output were discovered.
- **Improvement:** Extracting this logic into a dedicated `Services/AIResponseParser.js` class. This would make the router much cleaner and make the parsing logic easily testable.

### 18. Redesign with More Time
**Q: If you had three more months to work on this, what architectural changes would you make?**
- **Decision:** I would move from synchronous HTTP requests to an event-driven architecture for the AI generation.
- **Context:** Instead of the frontend waiting for a long HTTP response, it would submit a job, get a Job ID, and connect via WebSockets to receive real-time updates as the AI generates the outline and fetches YouTube videos in parallel.

### 19. Future Roadmap
**Q: Where do you see the product going in the next 6-12 months?**
- **Decision:** Adding community sharing and rich assessments.
- **Context:** Once the generation is stable, users will want to share their courses with others.
- **Roadmap:** I would implement a "public" flag on the `CourseModel`, create a community explorer page, and expand the AI to generate interactive coding environments or flashcards alongside the text.

### 20. Code Quality & Formatting
**Q: How do you ensure code quality across the frontend and backend?**
- **Decision:** The frontend includes ESLint, while the backend relies on manual formatting.
- **Context:** The frontend ecosystem naturally pushes for linting (set up by Vite).
- **Improvement:** Setting up a monorepo structure with shared ESLint and Prettier configs, enforced by a Husky pre-commit hook, would ensure consistent quality across the entire stack.
