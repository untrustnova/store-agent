import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { useAuthorization } from "../../components/content/Authentication"
import RequestAPIApp from "../../lib/request"
import HeadOperation from "../../components/content/HeadOperation"
import { Clock, CheckCircle2, XCircle, AlertCircle, DollarSign, History, RefreshCw, ChevronRight, Search } from "lucide-react"
import Link from "../../components/meta/Link"

export default function TransactionHistory() {
  const auth = useAuthorization()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(null) // ID of transaction being refreshed
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 })

  const loadTransactions = useCallback(async (page = currentPage) => {
    try {
      const response = await RequestAPIApp("/transactions/history", {
        headers: auth.headers(),
        params: { page }
      })
      
      if (response.data?.status === 'success' && response.data?.data?.transactions) {
        setTransactions(response.data.data.transactions)
        if (response.data.data.meta) {
          setMeta(response.data.data.meta)
        }
      }
    } catch {
      toast.error("Gagal memuat riwayat transaksi")
    } finally {
      setIsLoading(false)
    }
  }, [auth, currentPage])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions, currentPage])

  async function handleSyncStatus(id, referenceId) {
    setIsRefreshing(id)
    try {
      const response = await RequestAPIApp(`/transactions/${id}/check-status`, {
        method: "GET"
      })
      
      if (response.data?.status === 'success') {
        const midtransStatus = response.data.midtrans_status
        toast.success(`Status updated: ${midtransStatus.toUpperCase()}`)
        loadTransactions() // Reload the list
      }
    } catch (error) {
      toast.error("Gagal sinkronisasi status")
    } finally {
      setIsRefreshing(null)
    }
  }

  function getStatusConfig(status, paymentStatus) {
    const pStatus = typeof paymentStatus === 'string' ? paymentStatus : paymentStatus?.value || 'pending'
    
    switch (pStatus) {
      case 'paid':
        return { 
          icon: <CheckCircle2 size={14} />, 
          text: 'COMPLETED', 
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200' 
        }
      case 'failed':
        return { 
          icon: <XCircle size={14} />, 
          text: 'FAILED', 
          color: 'bg-rose-100 text-rose-700 border-rose-200' 
        }
      case 'expired':
        return { 
          icon: <AlertCircle size={14} />, 
          text: 'EXPIRED', 
          color: 'bg-neutral-100 text-neutral-500 border-neutral-200' 
        }
      default:
        return { 
          icon: <Clock size={14} />, 
          text: 'PENDING', 
          color: 'bg-amber-100 text-amber-700 border-amber-200' 
        }
    }
  }

  function formatTransactionType(type) {
    const t = typeof type === 'string' ? type : type?.value || 'other'
    const typeMap = {
      'pulsa': 'PULSA',
      'kuota': 'INTERNET DATA',
      'game': 'GAME TOPUP',
      'token_listrik': 'PLN TOKEN',
      'ewallet': 'E-WALLET',
      'bus': 'BUS TICKET'
    }
    return typeMap[t] || t.toUpperCase()
  }

  if (isLoading || auth.isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ba-shiroko-palette-medium" />
      </div>
    )
  }

  return (
    <>
      <HeadOperation title="AZStore - Transaction History" />
      <div className="w-full max-w-4xl mx-auto p-4 py-8">
        
        {/* Header UI BA Style */}
        <div className="w-full mb-8">
          <div className="ba-headers-title-text flex items-center px-4 rounded-t-lg">
            <History className="w-5 h-5 mr-2 text-ba-shiroko-palette-medium" />
            <h1 className="font-black text-ba-shiroko-palette-dark-2 tracking-tighter uppercase">Mission Logs</h1>
          </div>
          <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-lg ba-headers-content-bg shadow-sm flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
              Arsip seluruh riwayat transaksi mission yang telah anda lakukan.
            </p>
            <button onClick={() => loadTransactions()} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-ba-shiroko-palette-medium">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-neutral-200 opacity-60">
            <Search size={48} className="mx-auto text-neutral-300 mb-4" />
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em]">Belum Ada Data Transaksi</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const status = getStatusConfig(transaction.status, transaction.payment_status)
              const isPending = (typeof transaction.payment_status === 'string' ? transaction.payment_status : transaction.payment_status?.value) === 'pending'
              
              return (
                <div key={transaction.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden group hover:border-ba-shiroko-palette-medium transition-all">
                  <div className="flex flex-col sm:flex-row items-stretch">
                    <div className="p-5 flex-1 ba-headers-content-bg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-ba-shiroko-palette-medium tracking-widest">{transaction.reference_id}</span>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase">{new Date(transaction.created_at).toLocaleString('id-ID')}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-neutral-50 flex items-center justify-center text-ba-shiroko-palette-dark-2 border border-neutral-100 shadow-inner">
                          {transaction.type === 'game' ? <RefreshCw size={20} /> : <DollarSign size={20} />}
                        </div>
                        <div>
                          <h3 className="font-black text-ba-shiroko-palette-dark-2 text-sm uppercase tracking-tight">{formatTransactionType(transaction.type)}</h3>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">{transaction.payment_method?.toUpperCase() || 'MANUAL'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-4 sm:w-48 bg-neutral-50/50 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-neutral-100">
                      <p className="text-xs font-black text-ba-shiroko-palette-dark-3 mb-2 tracking-tight">Rp {Number(transaction.total_amount).toLocaleString()}</p>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${status.color} w-fit`}>
                        {status.icon}
                        <span className="text-[9px] font-black tracking-tighter">{status.text}</span>
                      </div>
                      
                      {isPending && (
                        <button 
                          onClick={() => handleSyncStatus(transaction.id, transaction.reference_id)}
                          disabled={isRefreshing === transaction.id}
                          className="mt-3 flex items-center gap-1.5 text-[9px] font-black text-ba-shiroko-palette-medium uppercase tracking-tighter hover:underline disabled:opacity-50"
                        >
                          <RefreshCw size={10} className={isRefreshing === transaction.id ? 'animate-spin' : ''} /> 
                          {isRefreshing === transaction.id ? 'SYNCING...' : 'SYNC STATUS'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* BA Styled Pagination */}
        {meta.last_page > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-neutral-200 rounded font-black text-[10px] text-neutral-400 uppercase tracking-widest hover:border-ba-shiroko-palette-medium transition-all disabled:opacity-30 shadow-sm"
            >
              PREV
            </button>
            <div className="flex items-center px-4 bg-ba-shiroko-palette-dark-2 rounded shadow-lg">
              <span className="text-[10px] font-black text-ba-shiroko-palette-light tracking-widest">PAGE {currentPage} OF {meta.last_page}</span>
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(meta.last_page, prev + 1))}
              disabled={currentPage === meta.last_page}
              className="px-4 py-2 bg-white border border-neutral-200 rounded font-black text-[10px] text-neutral-400 uppercase tracking-widest hover:border-ba-shiroko-palette-medium transition-all disabled:opacity-30 shadow-sm"
            >
              NEXT
            </button>
          </div>
        )}
      </div>
    </>
  )
}
