# 🧠 AI Course Generator — Complete Frontend Deep Dive

---

## 🗺️ Big Picture: The Folder Map

```
src/
├── main.jsx              ← App entry point (React root + global providers)
├── App.jsx               ← Route definitions (the router map)
├── index.css             ← Global styles (Tailwind base)
│
├── _context/             ← Global state (React Context API)
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── UserInputContext.jsx
│
├── _components/          ← Shared/global UI components
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── Footer.jsx
│   ├── BrandLogo.jsx
│   └── ThemeToggle.jsx
│
├── lib/                  ← Utility/helper functions
│   ├── api.js            ← Central fetch wrapper
│   └── utils.js
│
├── auth/                 ← Authentication screens
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── ProtectedRoute.jsx
│   └── Utils.jsx
│
├── dashboard/            ← Dashboard (after login)
│   ├── Dashboard.jsx
│   ├── Layout.jsx        ← Shell with Sidebar + Header
│   └── _components/
│       ├── AddCourse.jsx ← Main dashboard card + course list
│       ├── Sidebar.jsx
│       └── Header.jsx
│
├── create-course/        ← Course creation wizard
│   ├── CreateCourse.jsx  ← 3-step wizard (Category → Topic → Options)
│   ├── LayoutCourse.jsx  ← Outlet wrapper
│   ├── [courseId]/
│   │   ├── Page.jsx      ← Course layout + "Generate Lessons" button
│   │   └── _components/
│   │       ├── ChapterList.jsx
│   │       ├── CourseBasicInfo.jsx
│   │       ├── CourseDetail.jsx
│   │       ├── EditChapters.jsx
│   │       └── EditCourseBasicinfo.jsx
│   └── _components/
│       ├── SelectCategory.jsx
│       ├── TopicDescription.jsx
│       ├── SelectOption.jsx
│       └── LoadingDialog.jsx
│
└── course/[courseId]/    ← Studying a course
    └── start/
        ├── CourseStart.jsx     ← Two-panel study layout
        └── _components/
            ├── ChapterListCard.jsx
            └── ChapterContent.jsx  ← Notes, videos, quiz, PDF download
```

---

## 🚀 Step 1 — `main.jsx` (Entry Point)

```jsx
root.render(
  <StrictMode>
    <ThemeProvider>        ← Wraps EVERYTHING for dark/light mode
      <BrowserRouter>      ← Enables React Router across the app
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
```

**Why ThemeProvider wraps BrowserRouter?**
Because ThemeContext needs to apply dark/light classes to `document.documentElement` immediately on load — even before routing happens. If it were inside a route, the theme would flash on navigation.

**Why StrictMode?**
In development, React runs every effect twice to catch bugs. StrictMode does NOT affect production.

---

## 🗺️ Step 2 — `App.jsx` (The Router Map)

```
/                    → Hero landing page (public)
/login               → Login page (public)
/signup              → Signup page (public)

(ProtectedRoute guards everything below)
/dashboard           → DashboardLayout > Dashboard > AddCourse
/create-course       → LayoutCourse > CreateCourse (wizard)
/create-course/:id   → LayoutCourse > CourseLayout (review + generate)
/create-course/:id/start → CourseStart (study mode)
```

**Key concept: Nested Routes**
- `DashboardLayout` is the parent route at `/dashboard`. It renders a `<Sidebar>`, `<Header>`, and `<Outlet />`.
- `<Outlet />` is where the child route renders. So `/dashboard` renders `AddCourse` inside the layout shell.
- This is the standard React Router v6 pattern for shared layouts.

**Two important providers in App.jsx:**
- `<GoogleOAuthProvider>` — Wraps everything so any component can use Google OAuth
- `<AuthProvider>` — Wraps routes so `useAuth()` hook works everywhere

---

## 🔐 Step 3 — Authentication System

### `AuthContext.jsx` — Global Auth State

```jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
    setLoading(false);
  }, []);

  const login = (token, name, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userName', name);
    localStorage.setItem('email', email);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };
};
```

**How it works:**
1. On app load, `useEffect` checks if a JWT token exists in `localStorage`
2. If yes → user is authenticated, no redirect to login
3. `login()` stores token + user info in localStorage and updates state
4. `logout()` clears everything

**Why `{!loading && children}`?**
Without this guard, `ProtectedRoute` would briefly redirect the user to `/login` on page refresh (before localStorage check completes). The `loading` flag prevents that flash.

### `ProtectedRoute.jsx` — Route Guard

```jsx
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};
```

- It reads from `AuthContext`
- If not authenticated → redirect to `/login`
- `replace` means the login page doesn't get added to browser history (back button won't loop)
- `<Outlet />` renders the actual protected page when authenticated

### `Login.jsx` — How Login Works

**Dual authentication: Email/Password + Google OAuth**

**Email/Password flow:**
```
User fills form → handleLogin() → apiFetch("/auth/login") 
→ backend returns { jwtToken, name, email } 
→ login(token, name, email) stored in localStorage 
→ navigate("/dashboard")
```

**Google OAuth flow:**
```
User clicks GoogleLogin button → Google popup → credentialResponse.credential (JWT ID token)
→ apiFetch("/auth/google", { credential }) 
→ backend verifies Google token, returns our own JWT
→ login(jwtToken, name, email) → navigate("/dashboard")
```

**State management in Login:**
- `loginInfo` — form field values (controlled inputs)
- `showPassword` — toggles Eye/EyeOff icon
- `isLoading` — disables button during API call

**`handleChange` pattern:**
```jsx
const handleChange = (e) => {
  const { name, value } = e.target;
  setLoginInfo({ ...loginInfo, [name]: value });
};
```
This is dynamic key updating — one function handles both email and password fields by using `e.target.name` as the key.

---

## 🌐 Step 4 — `lib/api.js` (The Fetch Wrapper)

```jsx
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    // Parse error and throw
    throw new Error(message);
  }
  return res.json();
};
```

**Why a centralized fetch wrapper?**
1. You never forget to attach the `Authorization` header
2. Error handling is in one place — all components get consistent errors
3. `BASE_URL` is from env — easy to switch between dev and production
4. Every component just calls `apiFetch("/route")` instead of repeating headers

**`Bearer token`** — This is JWT authentication. The backend middleware reads the `Authorization` header, verifies the token, and extracts user info.

---

## 🎨 Step 5 — ThemeContext (Dark/Light Mode)

```jsx
const [theme, setTheme] = useState(() => {
  return localStorage.getItem("theme") || "light";
});

useEffect(() => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}, [theme]);
```

**How Tailwind dark mode works:**
- Tailwind's `dark:` classes activate when the `<html>` element has class `dark`
- `ThemeContext` adds/removes `"dark"` class on `document.documentElement` (= `<html>`)
- Theme is persisted in `localStorage` so it survives page refresh
- The lazy initial state `() => localStorage.getItem("theme")` reads the preference before first render — prevents flash

---

## 🏗️ Step 6 — Course Creation Wizard (`CreateCourse.jsx`)

The 3-step stepper:

```
Step 0: SelectCategory   → user picks category (Programming, Design, etc.)
Step 1: TopicDescription → user enters topic + description
Step 2: SelectOption     → user picks level, duration, chapter count, includeVideo
```

**How the stepper works:**
```jsx
const [activeIndex, setActiveIndex] = useState(0);

// Render based on step
{activeIndex == 0 ? <SelectCategory /> 
 : activeIndex == 1 ? <TopicDescription /> 
 : <SelectOption />}

// Buttons
<Button onClick={() => setActiveIndex(activeIndex + 1)}>Next</Button>
<Button onClick={() => setActiveIndex(activeIndex - 1)}>Previous</Button>
```

**`checkStatus()` — Next button validation:**
```jsx
if (activeIndex === 0 && !userCourseInput.Category) return true;  // disable
if (activeIndex === 1 && !userCourseInput.topic) return true;
// etc.
```
Returns `true` (= disabled) if the required field for the current step is empty.

**`UserInputContext`** — How child steps share data:
- `UserInputContext` is a simple `createContext(null)` — just a context object
- `LayoutCourse.jsx` (the parent) provides state via `UserInputContext.Provider`
- Each step component (SelectCategory, TopicDescription, SelectOption) reads and writes `userCourseInput` via `useContext(UserInputContext)`
- This avoids prop drilling through 3+ levels

**`GenerateCourseLayout()` — The key function:**
```
1. Build FINAL_PROMPT string with user's topic, level, duration, chapters
2. POST to /ai/generate-course → Gemini AI returns structured course JSON
3. Generate a UUID for the new course (courseId = uuidv4())
4. formatCourseDataForAPI() normalizes the AI response
5. POST to /course/save → saves to MongoDB
6. navigate(`/create-course/${courseId}`) → go to layout review
```

---

## 📋 Step 7 — Course Layout Page (`[courseId]/Page.jsx`)

This page is the "review and generate" screen.

**`fetchCourse()`** — Loads course from MongoDB on mount
```jsx
const fetchCourse = useCallback(async () => {
  const data = await apiFetch(`/course/${courseId}`);
  if (data.success) setCourse(data.data);
}, [courseId]);
```
`useCallback` prevents `fetchCourse` from being recreated on every render, which would cause infinite `useEffect` loops.

**`GenerateAllChapterContent()` — Batch generation:**
```
1. Filter chapters where content is empty (pendingChapters)
2. Process 3 chapters at a time with Promise.all
3. For each chapter → generateChapterContent(chapter, index)
4. Track progress with generationProgress state
5. After all done → fetchCourse() to reload with new content
```

**Why batches of 3?**
- Sending all chapters at once would overwhelm the API with rate limits
- Sequential (one at a time) is too slow
- 3 concurrent is a sweet spot

**`generateChapterContent()` — Per-chapter content generation:**
```
1. Build a textPrompt for Gemini with course + chapter name
2. Parallel: textPromise (AI content) + videoPromise (YouTube)
3. Wait for both
4. POST to /course/save-chapter-content with { textContent, videos }
```

**Progress tracking state:**
```jsx
const [generationProgress, setGenerationProgress] = useState({
  current: "",    // chapter being processed now
  completed: 0,   // how many done
  total: 0,       // total to process
  failed: [],     // error messages
});
```

---

## 📚 Step 8 — Dashboard (`AddCourse.jsx`)

**Two `useEffect` hooks — why separate?**
```jsx
useEffect(() => {
  // Effect 1: runs once on mount → get user info from localStorage
  setUserName(localStorage.getItem("userName"));
  setEmail(localStorage.getItem("email"));
}, []);

useEffect(() => {
  // Effect 2: runs when email changes → fetch courses
  if (!email) return;
  fetchCourses();
}, [email]);
```
They're separate because `email` isn't available until the first effect runs. If they were combined, `fetchCourses` would run before `email` is set.

**`useMemo` for totalChapters:**
```jsx
const totalChapters = useMemo(
  () => courses.reduce((count, course) => 
    count + (course.courseOutput?.chapters?.length || 0), 0),
  [courses],
);
```
`useMemo` caches the calculation. It only recalculates when `courses` changes — not on every render.

**Optional chaining (`?.`):**
`course.courseOutput?.chapters?.length` — safely accesses nested properties without crashing if any parent is null/undefined.

---

## 🎓 Step 9 — Course Study Mode (`CourseStart.jsx`)

**Layout:** Two-panel (sidebar + content area)
- Left: Chapter list (sidebar)
- Right: Selected chapter's full content

**Responsive mobile behavior:**
```jsx
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

// On mobile: sidebar slides in from left
className={`transform transition-transform duration-300
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0   ← Always visible on desktop
`}
```

**Progress tracking with localStorage:**
```jsx
const toggleSectionDone = (chapterIndex, sectionIndex) => {
  const key = `${chapterIndex}-${sectionIndex}`;
  setCompletedSections(current => {
    const next = { ...current, [key]: !current[key] };
    localStorage.setItem(`course-progress-${courseId}`, JSON.stringify(next));
    return next;
  });
};
```
- Progress is keyed by `"0-1"` (chapter 0, section 1)
- Stored in localStorage so progress survives page refresh
- Functional update pattern `setCompletedSections(current => ...)` ensures we always work with the latest state

**Body scroll lock when mobile sidebar is open:**
```jsx
useEffect(() => {
  document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  return () => { document.body.style.overflow = "auto"; }; // cleanup
}, [isSidebarOpen]);
```

---

## 📄 Step 10 — `ChapterContent.jsx` (The Main Study Component)

**What it renders for each content section:**
1. **Title** + "Mark as Done" button
2. **Description** (the explanation text)
3. **Learning Objectives** (bullet list)
4. **Key Topics** (pill badges)
5. **Code Example** (syntax-styled code block)
6. **Suggested Readings** (links)
7. **Quick Quiz** (interactive MCQ)

**Quiz logic:**
```jsx
const [selectedAnswers, setSelectedAnswers] = useState({});

// Key format: "sectionIndex-questionIndex"
selectAnswer(sectionIndex, questionIndex, option) → 
  updates selectedAnswers["0-1"] = "Python"

isCorrectAnswer(selected, answer) →
  selected.trim().toLowerCase() === answer.trim().toLowerCase()
```

**Button color logic:**
```jsx
isSelected && isCorrect → green
isSelected && !isCorrect → red
!isSelected && hasAnswered && isCorrect → show correct answer in green
default → neutral gray
```

**PDF Download — Dynamic Import:**
```jsx
const [{ default: html2canvas }, { default: jsPDF }] =
  await Promise.all([import("html2canvas"), import("jspdf")]);
```
- `html2canvas` + `jsPDF` are **lazy loaded** — only downloaded when user clicks Download
- This keeps the initial bundle smaller
- The hidden `<div ref={pdfExportRef}>` is rendered off-screen at `left: -9999px`
- `html2canvas` screenshots it, `jsPDF` converts to PDF

---

## 🎤 Interview Questions & Answers

### React Core

**Q: What is the difference between `useState` and `useContext`?**
> `useState` manages local component state. `useContext` reads shared global state from a `Context.Provider` higher up in the tree. In this app, `useContext(AuthContext)` reads `isAuthenticated` from `AuthProvider` without passing it as props through every component.

**Q: Why do we use `useCallback` for `fetchCourse`?**
> `fetchCourse` is defined inside `CourseLayout` component, so it gets recreated on every render. If it were in a `useEffect` dependency array without `useCallback`, the effect would run on every render, causing an infinite loop. `useCallback` memoizes it so it only changes when `courseId` changes.

**Q: What is `useEffect` cleanup and why does CourseStart use it?**
> The cleanup function runs before the effect re-runs or when the component unmounts. CourseStart uses it to reset `document.body.style.overflow` when the mobile sidebar closes or the component unmounts — preventing a bug where the page stays un-scrollable.

**Q: What is `useMemo` and when should you use it?**
> `useMemo` caches a computed value and only recalculates it when its dependencies change. In `AddCourse`, `totalChapters` is computed by reducing over all courses — if we didn't memoize it, it would recalculate on every keystroke or state change even when `courses` hasn't changed.

**Q: Explain controlled vs uncontrolled components.**
> Controlled: input value is driven by React state (`value={loginInfo.email}` + `onChange`). React is the source of truth. Uncontrolled: you use a `ref` to read the value when needed. This app uses controlled inputs in Login/Signup for real-time validation.

---

### Routing

**Q: What is `<Outlet />` in React Router v6?**
> `Outlet` is where a parent route renders its child routes. `DashboardLayout` renders `<Outlet />` inside its shell (sidebar + header), so whatever child route matches (like `/dashboard`) renders inside that layout.

**Q: How does `ProtectedRoute` work?**
> It reads `isAuthenticated` from `AuthContext`. If false → `<Navigate to="/login" replace />`. If true → `<Outlet />` which renders the actual protected page. The `replace` prop prevents `/login` from being added to history.

**Q: What is the `replace` prop in `<Navigate replace />`?**
> Without `replace`, clicking Back after being redirected to login would return the user to the protected page they can't access. With `replace`, the redirect replaces the current history entry, so Back goes further back to where they came from legitimately.

---

### State Management

**Q: Why did you use Context API instead of Redux?**
> The app has only two global states — auth (isAuthenticated) and theme (dark/light). Context API is built into React and perfectly sufficient for this scale. Redux adds complexity (actions, reducers, store) that would be overkill here.

**Q: How does theme persistence work across page refreshes?**
> `ThemeContext` uses lazy initial state `() => localStorage.getItem("theme") || "light"` — this runs once before the first render and reads the saved preference. The `useEffect` keeps localStorage in sync whenever theme changes. So on reload, the saved theme is read immediately.

**Q: How does course progress persist across page refreshes?**
> Progress is stored in `localStorage` with key `course-progress-${courseId}`. When `CourseStart` mounts, it reads this key and restores `completedSections` state. Every toggle updates both React state and localStorage simultaneously.

---

### Architecture

**Q: Why is `apiFetch` a separate utility?**
> Centralized fetch wrapper means: (1) JWT token is always attached automatically, (2) error parsing is consistent, (3) base URL is configured once from env. Without it, every component would duplicate header setup and error handling.

**Q: How does the 3-step wizard share state between steps?**
> `UserInputContext` is provided by `LayoutCourse.jsx` (the parent). Each step component uses `useContext(UserInputContext)` to read and write `userCourseInput`. This avoids prop drilling through CreateCourse → SelectCategory → etc.

**Q: Why does the app use `uuid` for courseId?**
> MongoDB's default `_id` is a complex ObjectId. A UUID is human-readable, URL-safe, and can be generated on the frontend before the API call — meaning the app can navigate to `/create-course/${courseId}` immediately after saving without waiting for the DB to return an ID.

**Q: What is `Promise.all` and where do you use it?**
> `Promise.all` runs multiple async operations in parallel and waits for all to complete. In `generateChapterContent`, `textPromise` (AI content) and `videoPromise` (YouTube) run simultaneously — cutting wait time roughly in half compared to sequential awaits.

---

### Performance

**Q: What is lazy loading and where is it used?**
> `html2canvas` and `jsPDF` are loaded with dynamic `import()` only when the user clicks "Download PDF". This keeps the initial JS bundle smaller, making the app load faster for users who never download PDFs.

**Q: How does the batch processing of 3 chapters work?**
> ```js
> for (let i = 0; i < pendingChapters.length; i += 3) {
>   await Promise.all(pendingChapters.slice(i, i+3).map(runChapter));
> }
> ```
> Each iteration runs up to 3 chapters concurrently, then waits for all 3 before starting the next batch. This balances speed vs API rate limits.

---

### Advanced

**Q: What is `dangerouslySetInnerHTML` and when is it safe to use?**
> It sets raw HTML into a DOM element, bypassing React's sanitization. It's used in the PDF export area to render formatted text (bold, lists). It's "safe" here because the HTML is generated by our own `formatTextForPdf()` function from trusted data — not from user input.

**Q: What is the `key` prop and why does it matter?**
> React uses `key` to identify which list items changed, so it can re-render only those items instead of the whole list. In `ChapterContent`, quiz questions use `key={questionIndex}` so React tracks each question card individually.

**Q: Explain the quiz answer key format `"${sectionIndex}-${questionIndex}"`.**
> A single flat object stores all quiz answers. The composite key format separates answers by section AND question, preventing collisions. For example, section 0, question 1 = key `"0-1"`, section 1, question 1 = key `"1-1"`.

---

## 🔄 Complete Data Flow (End to End)

```
User fills form (3 steps)
    ↓
CreateCourse builds FINAL_PROMPT
    ↓
apiFetch("/ai/generate-course") → Gemini API → returns JSON layout
    ↓
formatCourseDataForAPI() normalizes AI output
    ↓
apiFetch("/course/save") → MongoDB stores course
    ↓
navigate(`/create-course/${courseId}`)
    ↓
CourseLayout loads & displays chapter list
    ↓
User clicks "Generate Lessons"
    ↓
GenerateAllChapterContent():
  - 3 chapters at a time with Promise.all
  - Each chapter: apiFetch("/ai/generate-chapter") + apiFetch("/ai/get-videos")
  - apiFetch("/course/save-chapter-content") saves to MongoDB
    ↓
User clicks "Start" from Dashboard
    ↓
CourseStart loads course, user clicks chapter
    ↓
ChapterContent renders notes, videos, quiz
    ↓
User marks sections done → saved to localStorage
User downloads PDF → lazy-loaded html2canvas + jsPDF
```
