import { Outlet } from "react-router-dom"
import { Users, LayoutDashboard, Settings, FileText } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const sidebarLinks = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    path: "/admin"
  },
  {
    icon: <Users size={20} />,
    label: "Agents",
    path: "/admin/users"
  },
  {
    icon: <FileText size={20} />,
    label: "Transactions",
    path: "/admin/transactions"
  },
  {
    icon: <Settings size={20} />,
    label: "Settings",
    path: "/admin/settings"
  }
]

export default function AdminLayout() {
  const location = useLocation()
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-8">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors ${
                location.pathname === link.path ? "bg-gray-700" : ""
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-100">
        <Outlet />
      </main>
    </div>
  )
}
