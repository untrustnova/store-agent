import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../lib/request"
import { useAuthorization } from "../components/content/Authentication"
import { ArrowRight, Wallet, Phone, CheckCircle2 } from "lucide-react"
import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"
import HeadOperation from "../components/content/HeadOperation"

const createEWalletValidate = new validate.Form("ewallet")
createEWalletValidate.append({
  ewallet_id: validate.number("E-Wallet").require(),
  phone: validate.string("Nomor Telepon").require().min(10).max(15),
  amount: validate.number("Nominal").require().min(10000)
})

export default function EWalletPage() {
  const [ewallets, setEwallets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEwallet, setSelectedEwallet] = useState(null)
  const [messageErr, setMessageErr] = useState({})
  const [loading, setLoading] = useState(false)
  const auth = useAuthorization()

  const loadEWallets = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/services/e-wallets")
      if (response.data?.status === "success" && response.data?.data?.ewallets) {
        setEwallets(response.data.data.ewallets)
      }
    } catch {
      toast.error("Gagal memuat daftar e-wallet")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEWallets()
    
    // Ensure Snap is loaded
    if (!window.snap) {
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', 'SB-Mid-client-vP-y_m_O-5e_x-x_');
      document.body.appendChild(script);
    }
  }, [loadEWallets])

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return

    const form = new FormData(e.target)
    const data = Object.fromEntries(form)
    
    const structureForm = {
      ewallet_id: Number(selectedEwallet?.id || 0),
      phone: String(data.phone || ""),
      amount: Number(data.amount || 0)
    }

    // Validate form
    const isValid = createEWalletValidate.validate(structureForm)
    if (isValid) {
      const parseErrorValid = HandleingValidateError(isValid)
      setMessageErr(parseErrorValid.context)
      toast.error("Input tidak valid")
      return
    }
    
    setMessageErr({})
    setLoading(true)

    const response = await RequestAPIApp("/transactions", {
      method: "POST",
      data: {
        type: "ewallet",
        amount: structureForm.amount,
        payment_method: "bank_transfer",
        details: {
          product_id: structureForm.ewallet_id,
          phone_number: structureForm.phone
        }
      }
    })

    setLoading(false)

    if (!response.isError && response.data?.data?.snap_token) {
      window.snap.pay(response.data.data.snap_token, {
        onSuccess: () => toast.success("Pembayaran sedang diproses!"),
        onPending: () => toast.info("Menunggu pembayaran anda."),
        onError: () => toast.error("Pembayaran gagal")
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ba-shiroko-palette-medium" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <HeadOperation title="AZStore - Top Up E-Wallet" />
      
      {/* Header UI ala Menu */}
      <div className="w-full mb-6">
        <div className="ba-headers-title-text flex items-center px-4 rounded-t-lg">
          <Wallet className="w-5 h-5 mr-2 text-ba-shiroko-palette-medium" />
          <h1 className="font-bold text-ba-shiroko-palette-dark-2">Top Up E-Wallet</h1>
        </div>
        <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-lg ba-headers-content-bg shadow-sm">
          <p className="text-sm text-neutral-600">
            Pilih layanan e-wallet favorit anda dan isi saldo secara instan dengan berbagai metode pembayaran.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* E-Wallet Selection */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <p className="text-sm font-bold text-ba-shiroko-palette-dark-2 mb-4">PILIH LAYANAN E-WALLET</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ewallets.map(wallet => (
              <div
                key={wallet.id}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  selectedEwallet?.id === wallet.id 
                  ? "border-ba-shiroko-palette-medium bg-blue-50/50 ring-4 ring-ba-shiroko-palette-light/20" 
                  : "border-neutral-100 hover:border-ba-shiroko-palette-light bg-white"
                }`}
                onClick={() => setSelectedEwallet(wallet)}
              >
                {selectedEwallet?.id === wallet.id && (
                  <div className="absolute -top-2 -right-2 bg-ba-shiroko-palette-medium text-white rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 size={16} />
                  </div>
                )}
                <div className="w-12 h-12 rounded-full bg-ba-shiroko-palette-white flex items-center justify-center text-ba-shiroko-palette-medium font-black text-xs border border-neutral-100 shadow-inner">
                  {wallet.code.toUpperCase()}
                </div>
                <p className="text-xs font-black text-center text-ba-shiroko-palette-dark-2">{wallet.name.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedEwallet && (
          <div className="space-y-4 bg-white p-6 rounded-lg border border-neutral-200 shadow-sm ba-headers-content-bg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-ba-shiroko-palette-medium"></div>
            
            <label className="block w-full">
              <p className={`mb-2 text-sm font-bold ${messageErr?.phone ? 'text-red-500' : 'text-ba-shiroko-palette-dark-2'}`}>
                NOMOR TELEPON {messageErr?.phone && <span className="text-xs font-normal">({messageErr.phone})</span>}
              </p>
              <Input
                name="phone"
                type="tel"
                icon={<Phone size={18} className="text-ba-shiroko-palette-medium" />}
                placeholder="Contoh: 08123456789"
                error={!!messageErr?.phone}
              />
            </label>

            <label className="block w-full">
              <p className={`mb-2 text-sm font-bold ${messageErr?.amount ? 'text-red-500' : 'text-ba-shiroko-palette-dark-2'}`}>
                NOMINAL TOP UP {messageErr?.amount && <span className="text-xs font-normal">({messageErr.amount})</span>}
              </p>
              <Input
                name="amount"
                type="number"
                min="10000"
                step="5000"
                icon={<span className="text-xs font-bold text-ba-shiroko-palette-medium">Rp</span>}
                placeholder="Minimal 10.000"
                error={!!messageErr?.amount}
              />
              <p className="text-[10px] text-neutral-400 mt-1 italic font-semibold">MINIMAL PENGISIAN ADALAH RP 10.000</p>
            </label>

            <div className="pt-4">
              <Button type="submit" className="w-full py-5 h-auto shadow-lg shadow-blue-200 mt-2" disabled={loading}>
                <div className="flex items-center justify-center font-black text-lg tracking-wide">
                  {loading ? "PROCESSING..." : <>
                    <span>KONFIRMASI TOP UP</span>
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </>}
                </div>
              </Button>
              <p className="text-center text-[10px] text-neutral-400 mt-4 uppercase font-bold tracking-tighter">
                * Transaksi akan diproses otomatis setelah pembayaran terverifikasi
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
