import TopNavBar from './TopNavBar'
import SideNavBar from './SideNavBar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed top navbar: height = 4rem (h-16) */}
      <header className="fixed inset-x-0 top-0 h-16 z-40 bg-white shadow-sm">
        <TopNavBar />
      </header>

      {/* Page area: add top padding equal to navbar height (pt-16) */}
      <div className="pt-16 flex">
        {/* Sidebar: use sticky so it stays visible but remains in normal flow.
            width = 16rem (w-64). On small screens you might hide or collapse it. */}
        <aside className="hidden md:block sticky top-16 w-64 h-[calc(100vh-4rem)] z-30">
          <SideNavBar />
        </aside>

        {/* Main content: flex-1 so it takes remaining width; give comfortable padding */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
