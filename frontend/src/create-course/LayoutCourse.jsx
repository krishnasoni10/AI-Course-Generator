import React, { useState } from "react";
import Header from "../dashboard/_components/Header";
import { Outlet } from "react-router-dom";
import { UserInputContext } from "@/_context/UserInputContext";

function LayoutCourse() {
  const [userCourseInput, setUserCourseInput] = useState({
    Category: "",    
  });

  return (
    <UserInputContext.Provider value={{ userCourseInput, setUserCourseInput }}>
      <div className="min-h-screen flex-1 bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
        <Header />
        <div className="min-h-[calc(100vh-88px)] bg-slate-50 p-5 transition-colors dark:bg-slate-950 md:p-10">
          <Outlet /> 
        </div>
      </div>
    </UserInputContext.Provider>
  );
}

export default LayoutCourse;
