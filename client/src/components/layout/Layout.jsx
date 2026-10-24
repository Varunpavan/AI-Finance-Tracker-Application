import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  let handleOpenSidebar = () => {
    setSidebarOpen(true)
  }

  let handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-ink text-bone overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={handleOpenSidebar} />
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
