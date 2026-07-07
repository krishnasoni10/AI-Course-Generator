import CourseBasicInfo from '@/create-course/[courseId]/_components/CourseBasicInfo';
import CourseDetail from '@/create-course/[courseId]/_components/CourseDetail';
import ChapterList from '@/create-course/[courseId]/_components/ChapterList';
import React from 'react'
import { useEffect, useState } from "react";  
import { useParams } from "react-router-dom";  
import { apiFetch } from "@/lib/api";

function Course() {
  const { courseId } = useParams();  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await apiFetch(`/course/${courseId}`);
        if (data.success) {
          setCourse(data.data);
        } else {
          console.error("Course not found:", data.message);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);  
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        Loading your new course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        Error: Could not find your course.
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className='px-10 p-10 md:px-20 lg:px-44'>
         <CourseBasicInfo course={course} />
         <CourseDetail course={course} />
         <ChapterList course={course}/>
      </div>
    </div>
  )
}

export default Course
