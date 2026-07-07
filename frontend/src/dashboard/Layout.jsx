import Sidebar from './_components/Sidebar'
import React from 'react'
import Header from './_components/Header'
import { Outlet } from 'react-router-dom'

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="md:w-64 hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1">
        <Header />
        <div className="mt-4 p-5 md:p-10">
          <Outlet /> 
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout


