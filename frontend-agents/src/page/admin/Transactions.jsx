import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../../lib/request"
import { useAuthorization } from "../../components/content/Authentication"
import { FileText, Search, Filter, CheckCircle2, XCircle, Clock, MoreVertical, Eye } from "lucide-react"
import HeadOperation from "../../components/content/HeadOperation"

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [meta, setMeta] = useState({})
  const auth = useAuthorization()

  const loadTransactions = useCallback(async (page = 1) => {
    try {
      const response = await RequestAPIApp(`/admin/transactions?page=${page}`, {
        headers: auth.headers()
      })
      if (response.data?.status === "success" && response.data?.data) {
        setTransactions(response.data.data.transactions)
        setMeta(response.data.data.meta)
      }
    } catch (error) {
      toast.error("Gagal memuat data transaksi")
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const getStatusBadge = (status) => {
    const statusStr = typeof status === 'string' ? status : status?.value || 'pending'
    
    switch (statusStr) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase"><CheckCircle2 size={10} /> Success</span>
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black uppercase"><XCircle size={10} /> Failed</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black uppercase"><Clock size={10} /> Pending</span>
    }
  }

  const formatType = (type) => {
    const t = typeof type === 'string' ? type : type?.value || 'UNKNOWN'
    return String(t).toUpperCase()
  }

  const getProductDetail = (trx) => {
    if (!trx.details) return 'N/A'
    const details = trx.details
    
    // Check various common keys used across different mission types
    const mainDetail = details.phone_number || details.meter_number || details.uid || details.phone || 'N/A'
    const subDetail = details.game_id || details.provider || ''
    
    return (
      <div className="flex flex-col">
        <span className="text-[9px] text-neutral-400 font-bold uppercase truncate max-w-[150px]">{mainDetail}</span>
        {subDetail && <span className="text-[8px] text-ba-shiroko-palette-medium font-black tracking-tighter uppercase">{subDetail}</span>}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ba-shiroko-palette-medium" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <HeadOperation title="AZStore Admin - Transactions" />
      
      <div className="w-full mb-8">
        <div className="ba-headers-title-text flex items-center justify-between px-4 rounded-t-lg">
          <div className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-ba-shiroko-palette-medium" />
            <h1 className="font-black text-ba-shiroko-palette-dark-2 tracking-tighter uppercase">MISSION LOG TERMINAL</h1>
          </div>
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"><Search size={18} className="text-neutral-400" /></button>
            <button className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"><Filter size={18} className="text-neutral-400" /></button>
          </div>
        </div>
        <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-lg ba-headers-content-bg shadow-sm">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Database seluruh aktivitas supply mission yang tercatat dalam log sistem.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-tighter border-b border-neutral-100 text-left">
                <th className="p-4">Reference</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Mission Type / Product</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.map((trx) => (
                <tr key={trx.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-black text-ba-shiroko-palette-dark-3 text-xs tracking-tighter">{trx.reference_id}</span>
                      <span className="text-[9px] text-neutral-400 font-bold uppercase">{new Date(trx.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-ba-shiroko-palette-dark-2 text-xs uppercase tracking-tight">{trx.user?.name || 'N/A'}</span>
                      <span className="text-[9px] text-neutral-400 font-bold tracking-tighter">{trx.user?.email || '-'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-ba-shiroko-palette-medium uppercase tracking-tighter">{formatType(trx.type)}</span>
                      {getProductDetail(trx)}
                    </div>
                  </td>
                  <td className="p-4 font-black text-ba-shiroko-palette-dark-2">
                    <span className="text-xs">Rp {Number(trx.total_amount).toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(trx.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <button className="p-2 text-neutral-400 hover:text-ba-shiroko-palette-medium hover:bg-ba-shiroko-palette-light/10 rounded-md transition-all">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-neutral-400 italic font-bold text-xs uppercase tracking-widest">
                    Log transaksi masih kosong
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {meta.last_page > 1 && (
          <div className="p-4 bg-neutral-50 flex items-center justify-between border-t border-neutral-100">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Archive Page {meta.current_page} of {meta.last_page}</p>
            <div className="flex gap-1">
              {[...Array(meta.last_page)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => loadTransactions(i + 1)}
                  className={`w-8 h-8 rounded font-black text-[10px] transition-all ${
                    meta.current_page === i + 1
                    ? "bg-ba-shiroko-palette-medium text-white shadow-md"
                    : "bg-white border border-neutral-200 text-neutral-400 hover:border-ba-shiroko-palette-light"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
