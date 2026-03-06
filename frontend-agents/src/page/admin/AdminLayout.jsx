import { Outlet } from "react-router-dom"
import { Users, LayoutDashboard, Settings, FileText, Menu, X, Shield, Bell, LogOut, Boxes } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuthorization } from "../../components/content/Authentication"

const sidebarLinks = [
  {
    icon: <LayoutDashboard size={18} />,
    label: "DASHBOARD",
    path: "/admin"
  },
  {
    icon: <Users size={18} />,
    label: "AGENTS MANAGEMENT",
    path: "/admin/users"
  },
  {
    icon: <FileText size={18} />,
    label: "TRANSACTIONS",
    path: "/admin/transactions"
  },
  {
    icon: <Settings size={18} />,
    label: "SYSTEM SETTINGS",
    path: "/admin/settings"
  }
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const author = useAuthorization()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  const user = author.getUser()

  return (
    <div className="flex min-h-screen bg-neutral-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-[100] h-screen transition-all duration-300 ease-in-out border-r-4 border-ba-shiroko-palette-medium-2 flex flex-col ${isSidebarOpen ? 'w-72' : 'w-0 lg:w-20 overflow-hidden'}`}>
        <div className="h-[55px] bg-ba-shiroko-palette-medium flex items-center px-6 shrink-0 shadow-md">
          <Shield className="text-white mr-3 shrink-0" size={20} />
          <h1 className={`text-white font-black tracking-tighter uppercase italic transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            Admin Terminal
          </h1>
        </div>
        
        <div className="flex-1 bg-white flex flex-col py-6 overflow-y-auto ba-headers-content-bg">
          {/* User Info Snippet */}
          <div className={`px-4 mb-8 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
            <div className="p-4 rounded-xl bg-ba-shiroko-palette-dark-2 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-xl"></div>
              <p className="text-[9px] font-black text-ba-shiroko-palette-light uppercase tracking-widest mb-1">Authorized Admin</p>
              <h3 className="font-black text-xs uppercase tracking-tighter truncate">{user?.name || "ADMINISTRATOR"}</h3>
            </div>
          </div>

          <nav className="space-y-1 px-3">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== "/admin" && location.pathname.startsWith(link.path))
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all group ${
                    isActive 
                    ? "bg-ba-shiroko-palette-medium text-white shadow-md shadow-blue-100 translate-x-1" 
                    : "text-neutral-400 hover:bg-neutral-50 hover:text-ba-shiroko-palette-medium"
                  }`}
                >
                  <span className={`shrink-0 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110 group-hover:rotate-3'}`}>
                    {link.icon}
                  </span>
                  <span className={`transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto px-3 pt-6 border-t border-neutral-100">
            <button
              onClick={() => author.RemoveAuth({ useRedirect: true })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest text-rose-400 hover:bg-rose-50 transition-all group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className={`transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                TERMINATE SESSION
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-[55px] bg-white border-b-4 border-neutral-100 flex items-center justify-between px-6 shrink-0 z-[90] shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-neutral-50 rounded-md text-ba-shiroko-palette-medium transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="h-6 w-[1px] bg-neutral-200"></div>
            <div className="flex items-center gap-2">
              <Boxes size={18} className="text-ba-shiroko-palette-medium" />
              <span className="text-[10px] font-black text-ba-shiroko-palette-dark-2 uppercase tracking-widest">Supply Hub Control</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-neutral-50 rounded-md text-neutral-400 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-neutral-100 border-2 border-ba-shiroko-palette-medium overflow-hidden">
              <img src="/guest-user.webp" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-neutral-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
