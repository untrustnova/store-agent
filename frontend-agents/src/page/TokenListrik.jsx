import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../lib/request"
import { useAuthorization } from "../components/content/Authentication"
import { ArrowRight, Zap, CheckCircle2, UserCircle2 } from "lucide-react"
import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"
import HeadOperation from "../components/content/HeadOperation"

const createTokenValidate = new validate.Form("token")
createTokenValidate.append({
  meter_number: validate.string("Nomor Meter").require().min(11).max(11),
})

export default function TokenListrikPage() {
  const [tokenProducts, setTokenProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [messageErr, setMessageErr] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const auth = useAuthorization()

  const loadTokenProducts = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/products/token-listrik")
      if (response.data?.status === "success" && response.data?.data?.tokens) {
        setTokenProducts(response.data.data.tokens)
      }
    } catch {
      toast.error("Gagal memuat produk token")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTokenProducts()
    if (!window.snap) {
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', 'SB-Mid-client-vP-y_m_O-5e_x-x_');
      document.body.appendChild(script);
    }
  }, [loadTokenProducts])

  async function handleCheckMeter(e) {
    const meterNumber = e.target.value
    if (meterNumber.length !== 11) return

    setChecking(true)
    try {
      const response = await RequestAPIApp("/services/validate-token-meter", {
        method: "POST",
        data: { meter_number: meterNumber }
      })

      if (response.data?.status === "success" || response.data?.valid) {
        setCustomerInfo({
          name: response.data.customer_name || response.data.data?.customer_name,
          address: response.data.customer_address || response.data.data?.customer_address,
          tariff: response.data.tariff || response.data.data?.tariff
        })
        setMessageErr({})
        toast.success("ID Pelanggan Valid")
      }
    } catch (error) {
      toast.error("ID Pelanggan tidak ditemukan")
      setCustomerInfo(null)
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    
    const form = new FormData(e.target)
    const data = Object.fromEntries(form)
    
    if (!selectedProduct) {
      toast.error("Pilih nominal token terlebih dahulu")
      return
    }

    const structureForm = { meter_number: data.meter_number }
    const isValid = createTokenValidate.validate(structureForm)
    
    if (isValid) {
      const parseErrorValid = HandleingValidateError(isValid)
      setMessageErr(parseErrorValid.context)
      toast.error("Nomor meter tidak valid")
      return
    }
    
    setMessageErr({})
    setLoading(true)

    try {
      const response = await RequestAPIApp("/transactions", {
        method: "POST",
        data: {
          type: "token_listrik",
          amount: selectedProduct.price,
          payment_method: "bank_transfer",
          details: {
            product_id: selectedProduct.id,
            meter_number: data.meter_number
          }
        }
      })

      if (!response.isError && response.data?.data?.snap_token) {
        window.snap.pay(response.data.data.snap_token, {
          onSuccess: () => toast.success("Pembayaran sedang diproses!"),
          onPending: () => toast.info("Menunggu pembayaran anda."),
          onError: () => toast.error("Pembayaran gagal")
        })
      }
    } catch (error) {
      toast.error("Gagal membuat transaksi")
    } finally {
      setLoading(false)
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
      <HeadOperation title="AZStore - Token Listrik" />
      
      <div className="w-full mb-6">
        <div className="ba-headers-title-text flex items-center px-4 rounded-t-lg">
          <Zap className="w-5 h-5 mr-2 text-ba-shiroko-palette-medium" />
          <h1 className="font-bold text-ba-shiroko-palette-dark-2">Token Listrik PLN</h1>
        </div>
        <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-lg ba-headers-content-bg shadow-sm">
          <p className="text-sm text-neutral-600">
            Beli token listrik prabayar dengan proses otomatis dan aman.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-ba-shiroko-palette-medium"></div>
          <label className="block w-full">
            <p className={`mb-2 text-sm font-bold ${messageErr?.meter_number ? 'text-red-500' : 'text-ba-shiroko-palette-dark-2'}`}>
              NOMOR METER / ID PELANGGAN {messageErr?.meter_number && <span className="text-xs font-normal">({messageErr.meter_number})</span>}
            </p>
            <Input
              name="meter_number"
              type="text"
              icon={<Zap size={18} className="text-ba-shiroko-palette-medium" />}
              placeholder="Masukkan 11 digit nomor meter"
              maxLength={11}
              onBlur={handleCheckMeter}
              error={!!messageErr?.meter_number}
            />
            {checking && <p className="text-[10px] text-ba-shiroko-palette-medium mt-1 animate-pulse font-bold uppercase">Mengecek ID Pelanggan...</p>}
          </label>

          {customerInfo && (
            <div className="mt-4 p-4 bg-ba-shiroko-palette-white rounded-lg border border-ba-shiroko-palette-light/30 flex items-start gap-3">
              <UserCircle2 className="w-5 h-5 text-ba-shiroko-palette-medium mt-0.5" />
              <div>
                <p className="text-xs font-black text-ba-shiroko-palette-dark-3 uppercase">{customerInfo.name}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5 uppercase">{customerInfo.tariff} • {customerInfo.address}</p>
              </div>
            </div>
          )}
        </div>

        {customerInfo && (
          <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm ba-headers-content-bg animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-bold text-ba-shiroko-palette-dark-2 mb-4 uppercase tracking-tighter">Pilih Nominal Token</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tokenProducts.map((token) => (
                <div
                  key={token.id}
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    selectedProduct?.id === token.id
                      ? "border-ba-shiroko-palette-medium bg-blue-50/50 ring-4 ring-ba-shiroko-palette-light/20"
                      : "border-neutral-100 hover:border-ba-shiroko-palette-light bg-white"
                  }`}
                  onClick={() => setSelectedProduct(token)}
                >
                  {selectedProduct?.id === token.id && (
                    <div className="absolute -top-2 -right-2 bg-ba-shiroko-palette-medium text-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                  <p className="font-black text-ba-shiroko-palette-dark-3 text-lg uppercase">Rp {token.nominal.toLocaleString()}</p>
                  <div className="w-full h-[1px] bg-neutral-100 my-2"></div>
                  <p className="text-[10px] font-bold text-ba-shiroko-palette-medium">Bayar: Rp {token.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedProduct && (
          <div className="pt-2">
            <Button type="submit" className="w-full py-5 h-auto shadow-lg shadow-blue-200" disabled={loading}>
              <div className="flex items-center justify-center font-black text-lg tracking-wide uppercase">
                {loading ? "PROCESSING..." : <>
                  <span>BELI TOKEN SEKARANG</span>
                  <ArrowRight className="w-6 h-6 ml-2" />
                </>}
              </div>
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
