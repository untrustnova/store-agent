import { useEffect, useState, useCallback } from "react"
import { Users, CreditCard } from "lucide-react"
import RequestAPIApp from "../../lib/request"
import { useAuthorization } from "../../components/content/Authentication"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_agents: 0,
    active_agents: 0,
    today_transactions: 0,
    today_amount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const auth = useAuthorization()

  useEffect(() => {
    loadDashboardStats()
  }, [loadDashboardStats])

  const loadDashboardStats = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/admin/dashboard", {
        headers: auth.headers()
      })
      if (response.data?.data) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  const statCards = [
    {
      title: "Total Agents",
      value: stats.total_agents,
      icon: <Users className="text-blue-500" size={24} />
    },
    {
      title: "Active Agents",
      value: stats.active_agents,
      icon: <Users className="text-green-500" size={24} />
    },
    {
      title: "Today's Transactions",
      value: stats.today_transactions,
      icon: <CreditCard className="text-indigo-500" size={24} />
    },
    {
      title: "Today's Amount",
      value: `Rp ${Number(stats.today_amount || 0).toLocaleString()}`,
      icon: <CreditCard className="text-emerald-500" size={24} />
    }
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
