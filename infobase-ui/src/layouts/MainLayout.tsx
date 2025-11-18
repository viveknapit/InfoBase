import React from 'react'
import TopNavBar from './TopNavBar'
import SideNavBar from './SideNavBar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
   <>
   <div><TopNavBar/></div>
   <div><SideNavBar/></div>
   <main>
    <Outlet/>
   </main>
   </>
  )
}

export default MainLayout