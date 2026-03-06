import { Outlet } from "react-router-dom"
import { HistoryIcon, KeySquare, PenIcon, User2Icon, ChevronRight, Settings, Shield } from "lucide-react"
import { useLocation } from "react-router-dom"
import Link from "../../components/meta/Link"
import { useAuthorization } from "../../components/content/Authentication"

const listLinkAccount = [
  {
    category: "PERSONAL MISSION",
    list: [
      {
        icon: <User2Icon size={18} />,
        label: "PROFILE DATA",
        path: "/account"
      },
      {
        icon: <HistoryIcon size={18} />,
        label: "TRANSACTION LOG",
        path: "/account/transaction-history"
      },
    ]
  },
  {
    category: "TERMINAL SETTINGS",
    list: [
      {
        icon: <Settings size={18} />,
        label: "ACCOUNT CONFIG",
        path: "/account/manage"
      },
    ]
  }
]

export default function AccountSidebar({ children }) {
  const location = useLocation()
  const author = useAuthorization()

  if (author.isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ba-shiroko-palette-medium" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6 p-4 py-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 lg:w-72 shrink-0">
        <div className="bg-white rounded-xl border-b-4 border-ba-shiroko-palette-medium-2 shadow-lg overflow-hidden sticky top-20">
          <div className="ba-headers-title-text flex items-center px-4 py-3">
            <Shield className="w-4 h-4 mr-2 text-ba-shiroko-palette-medium" />
            <h2 className="font-black text-ba-shiroko-palette-dark-2 tracking-tighter uppercase text-xs">Access Control</h2>
          </div>
          
          <nav className="p-2 ba-headers-content-bg">
            {listLinkAccount.map((category, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="px-3 py-2">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">{category.category}</p>
                </div>
                <div className="space-y-1">
                  {category.list.map((item, c) => {
                    const isActive = location.pathname === item.path
                    return (
                      <Link 
                        href={item.path} 
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${
                          isActive 
                          ? "bg-ba-shiroko-palette-medium text-white shadow-md shadow-blue-100" 
                          : "text-neutral-500 hover:bg-neutral-50 hover:text-ba-shiroko-palette-medium"
                        }`} 
                        key={c}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-ba-shiroko-palette-medium'} transition-colors`}>
                            {item.icon}
                          </span>
                          <span className="text-[10px] font-black tracking-widest uppercase truncate">{item.label}</span>
                        </div>
                        <ChevronRight size={14} className={`${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all transform ${isActive ? 'translate-x-0' : '-translate-x-2'}`} />
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
          
          <div className="p-4 bg-neutral-50/50 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Terminal Session: Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl min-h-[600px]">
          {children ? children : <Outlet />}
        </div>
      </main>
    </div>
  )
}
