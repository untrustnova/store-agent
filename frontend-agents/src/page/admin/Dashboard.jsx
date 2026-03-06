import { useEffect, useState, useCallback } from "react"
import { Users, CreditCard, LayoutDashboard, TrendingUp, Wallet, ShieldCheck } from "lucide-react"
import RequestAPIApp from "../../lib/request"
import { useAuthorization } from "../../components/content/Authentication"
import HeadOperation from "../../components/content/HeadOperation"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_agents: 0,
    active_agents: 0,
    today_transactions: 0,
    today_amount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const auth = useAuthorization()

  const loadDashboardStats = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/admin/dashboard", {
        headers: auth.headers()
      })
      if (response.data?.status === "success" && response.data?.data) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  useEffect(() => {
    loadDashboardStats()
  }, [loadDashboardStats])

  const statCards = [
    {
      title: "TOTAL AGENTS",
      value: stats.total_agents,
      icon: <Users className="text-ba-shiroko-palette-medium" size={20} />,
      color: "border-ba-shiroko-palette-medium"
    },
    {
      title: "ACTIVE AGENTS",
      value: stats.active_agents,
      icon: <ShieldCheck className="text-emerald-500" size={20} />,
      color: "border-emerald-500"
    },
    {
      title: "TODAY TRX",
      value: stats.today_transactions,
      icon: <TrendingUp className="text-indigo-500" size={20} />,
      color: "border-indigo-500"
    },
    {
      title: "TODAY REVENUE",
      value: `Rp ${Number(stats.today_amount || 0).toLocaleString()}`,
      icon: <Wallet className="text-ba-shiroko-palette-medium-2" size={20} />,
      color: "border-ba-shiroko-palette-medium-2"
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ba-shiroko-palette-medium" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <HeadOperation title="AZStore Admin - Dashboard" />
      
      <div className="w-full mb-8">
        <div className="ba-headers-title-text flex items-center px-4 rounded-t-lg">
          <LayoutDashboard className="w-5 h-5 mr-2 text-ba-shiroko-palette-medium" />
          <h1 className="font-black text-ba-shiroko-palette-dark-2 tracking-tighter">ADMIN DASHBOARD</h1>
        </div>
        <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-lg ba-headers-content-bg shadow-sm">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Overview performa sistem dan statistik transaksi harian agen.
          </p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className={`bg-white p-5 rounded-lg border-l-4 ${stat.color} shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-neutral-400 tracking-tighter mb-1 uppercase">{stat.title}</p>
                <h3 className="text-xl font-black text-ba-shiroko-palette-dark-3">{stat.value}</h3>
              </div>
              <div className="p-2 bg-neutral-50 rounded-md group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-5 pointer-events-none group-hover:scale-150 transition-transform">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions / Other Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
            <h2 className="text-xs font-black text-ba-shiroko-palette-dark-2 tracking-tighter uppercase">Sistem Status</h2>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="p-6 ba-headers-content-bg min-h-[200px] flex flex-col justify-center items-center text-center">
            <ShieldCheck size={48} className="text-ba-shiroko-palette-light mb-4" />
            <p className="font-bold text-ba-shiroko-palette-dark-2">Semua Layanan Normal</p>
            <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-black">Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-xs font-black text-ba-shiroko-palette-dark-2 tracking-tighter uppercase">Pesan Terbaru</h2>
          </div>
          <div className="p-6 flex flex-col justify-center items-center text-center min-h-[200px]">
            <p className="text-sm italic text-neutral-400">Belum ada aktivitas terbaru hari ini.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
