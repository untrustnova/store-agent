import { useEffect, useState } from "react"
import { Users, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react"
import RequestAPIApp from "../../lib/request"
import { useAuthorization } from "../../components/content/Authentication"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    recentTransactions: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const auth = useAuthorization()

  useEffect(() => {
    loadDashboardStats()
  }, [])

  async function loadDashboardStats() {
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
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="text-blue-500" size={24} />,
      change: "+12%",
      trend: "up"
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions,
      icon: <CreditCard className="text-green-500" size={24} />,
      change: "+23%",
      trend: "up"
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
            <div className="flex items-center mt-4">
              {stat.trend === "up" ? (
                <ArrowUpRight className="text-green-500" size={20} />
              ) : (
                <ArrowDownRight className="text-red-500" size={20} />
              )}
              <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">ID</th>
                <th className="pb-3">User</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td className="py-3">{tx.id}</td>
                  <td className="py-3">{tx.user_name}</td>
                  <td className="py-3">{tx.type}</td>
                  <td className="py-3">Rp {tx.amount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      tx.status === "success" ? "bg-green-100 text-green-800" :
                      tx.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
