import TopNavBar from './TopNavBar'
import SideNavBar from './SideNavBar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
   <>
   <div className='flex flex-col'>
   <div className='w-full'><TopNavBar/></div>
    <div className='flex bg-blue-400'> 
      <div className=''><SideNavBar/></div>
      <div className='h-full w-full bg-green-800'>
        <main>
          <Outlet/>
        </main>
      </div>
    </div>
   </div>
   </>
  )
}

export default MainLayout