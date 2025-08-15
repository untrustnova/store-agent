import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useAuthorization } from "../../components/content/Authentication"
import RequestAPIApp from "../../lib/request"
import HeadOperation from "../content/HeadOperation"
import { Clock, CheckCircle, XCircle, AlertCircle, DollarSign } from "lucide-react"

export default function TransactionHistory() {
  const auth = useAuthorization()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadTransactions()
  }, [currentPage])

  async function loadTransactions() {
    try {
      const response = await RequestAPIApp("/transactions/history", {
        headers: auth.headers(),
        params: { page: currentPage }
      })
      
      if (response.data?.data?.transactions) {
        setTransactions(response.data.data.transactions)
      }
    } catch {
      toast.error("Failed to load transaction history", {
        description: "Please try again later"
      })
    } finally {
      setIsLoading(false)
    }
  }

  function getStatusIcon(status, paymentStatus) {
    if (paymentStatus === 'paid') {
      return <CheckCircle size={20} className="text-green-500" />
    } else if (paymentStatus === 'failed') {
      return <XCircle size={20} className="text-red-500" />
    } else if (paymentStatus === 'expired') {
      return <AlertCircle size={20} className="text-yellow-500" />
    } else {
      return <Clock size={20} className="text-blue-500" />
    }
  }

  function getStatusColor(status, paymentStatus) {
    if (paymentStatus === 'paid') {
      return 'bg-green-100 text-green-800'
    } else if (paymentStatus === 'failed') {
      return 'bg-red-100 text-red-800'
    } else if (paymentStatus === 'expired') {
      return 'bg-yellow-100 text-yellow-800'
    } else {
      return 'bg-blue-100 text-blue-800'
    }
  }

  function getStatusText(status, paymentStatus) {
    if (paymentStatus === 'paid') {
      return 'Completed'
    } else if (paymentStatus === 'failed') {
      return 'Failed'
    } else if (paymentStatus === 'expired') {
      return 'Expired'
    } else {
      return 'Pending'
    }
  }

  function formatTransactionType(type) {
    const typeMap = {
      'pulsa': 'Pulsa',
      'kuota': 'Data Package',
      'game': 'Game Credits',
      'token_listrik': 'Electricity Token',
      'ewallet': 'E-Wallet',
      'bus': 'Bus Ticket'
    }
    return typeMap[type] || type
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <>
      <HeadOperation title="AZStore - Transaction History" />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-2">View all your transaction history and payment status</p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Start making transactions to see them here</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.reference_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.payment_method}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {formatTransactionType(transaction.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Rp {Number(transaction.amount).toLocaleString()}
                        </div>
                        {transaction.admin_fee > 0 && (
                          <div className="text-xs text-gray-500">
                            + Rp {Number(transaction.admin_fee).toLocaleString()} fee
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(transaction.status, transaction.payment_status)}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status, transaction.payment_status)}`}>
                            {getStatusText(transaction.status, transaction.payment_status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {transactions.length > 0 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm font-medium text-gray-700">
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={transactions.length < 10} // Assuming 10 items per page
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </>
  )
}
