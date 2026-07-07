import { Routes, Route } from "react-router-dom";
import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Footer from "./_components/Footer";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Dashboard from "./dashboard/Dashboard";
import DashboardLayout from "./dashboard/Layout";
import CreateCourse from "./create-course/CreateCourse";
import LayoutCourse from "./create-course/LayoutCourse";
import CourseLayout from "./create-course/[courseId]/Page";
import CourseStart from "./course/[courseId]/start/CourseStart";
import { Toaster } from "sonner";
function App() {
  return (
    <> 
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Header />
            <Hero />
            <Footer/>
          </>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} /> {/* /dashboard */}{" "}
      </Route>
      {/* Course routes */}
      <Route path="/create-course" element={<LayoutCourse />}>
        <Route index element={<CreateCourse />} />

        <Route path=":courseId" element={<CourseLayout />} />
        <Route path=":courseId/start" element={<CourseStart />} />
      </Route>  
         
      
    </Routes>
    <Toaster richColors />
     </>
  );
}

export default App;
