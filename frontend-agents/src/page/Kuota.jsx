import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../lib/request"
import { useAuthorization } from "../components/content/Authentication"
import { ArrowRight, Wifi, Phone, CheckCircle2 } from "lucide-react"
import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"
import HeadOperation from "../components/content/HeadOperation"

const createKuotaValidate = new validate.Form("kuota")
createKuotaValidate.append({
  phone: validate.string("Nomor Telepon").require().min(10).max(15),
})

export default function KuotaPage() {
  const [kuotaProducts, setKuotaProducts] = useState({})
  const [providers, setProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [messageErr, setMessageErr] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const auth = useAuthorization()

  const loadKuotaProducts = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/products/kuota")
      if (response.data?.status === "success" && response.data?.data) {
        setKuotaProducts(response.data.data.kuota)
        setProviders(response.data.data.providers)
        if (response.data.data.providers.length > 0) {
          setSelectedProvider(response.data.data.providers[0])
        }
      }
    } catch {
      toast.error("Gagal memuat daftar produk kuota")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadKuotaProducts()
    
    if (!window.snap) {
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', 'SB-Mid-client-vP-y_m_O-5e_x-x_');
      document.body.appendChild(script);
    }
  }, [loadKuotaProducts])

  async function handleSubmit(e) {
    e.preventDefault()
    if(loading) return

    const form = new FormData(e.target)
    const data = Object.fromEntries(form)
    
    if (!selectedProduct) {
      toast.error("Pilih paket data terlebih dahulu")
      return
    }

    const structureForm = {
      phone: String(data?.phone||""),
    }

    // Validate form
    const isValid = createKuotaValidate.validate(structureForm)
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
        type: "kuota",
        amount: selectedProduct.price,
        payment_method: "bank_transfer",
        details: {
          product_id: selectedProduct.id,
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
      <HeadOperation title="AZStore - Paket Data" />
      
      <div className="w-full mb-6">
        <div className="ba-headers-title-text flex items-center px-4 rounded-t-lg">
          <Wifi className="w-5 h-5 mr-2 text-ba-shiroko-palette-medium" />
          <h1 className="font-bold text-ba-shiroko-palette-dark-2">Paket Data Internet</h1>
        </div>
        <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-lg ba-headers-content-bg shadow-sm">
          <p className="text-sm text-neutral-600">
            Beli paket data internet dengan harga terbaik untuk semua operator seluler.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-ba-shiroko-palette-medium"></div>
          <label className="block w-full">
            <p className={`mb-2 text-sm font-bold ${messageErr?.nomer_telepon ? 'text-red-500' : 'text-ba-shiroko-palette-dark-2'}`}>
              NOMOR TELEPON {messageErr?.nomer_telepon && <span className="text-xs font-normal">({messageErr.nomer_telepon})</span>}
            </p>
            <Input
              name="phone"
              type="tel"
              icon={<Phone size={18} className="text-ba-shiroko-palette-medium" />}
              placeholder="Contoh: 08123456789"
              error={!!messageErr?.nomer_telepon}
            />
          </label>
        </div>

        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <p className="text-sm font-bold text-ba-shiroko-palette-dark-2 mb-4">PILIH PROVIDER</p>
          <div className="flex flex-wrap gap-2">
            {providers.map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => {
                  setSelectedProvider(provider)
                  setSelectedProduct(null)
                }}
                className={`px-5 py-2 rounded-md text-sm font-bold transition-all border-2 ${
                  selectedProvider === provider
                    ? "border-ba-shiroko-palette-medium bg-ba-shiroko-palette-medium text-white shadow-md"
                    : "border-neutral-100 bg-neutral-50 text-neutral-500 hover:border-ba-shiroko-palette-light"
                }`}
              >
                {provider.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {selectedProvider && kuotaProducts[selectedProvider] && (
          <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm ba-headers-content-bg">
            <p className="text-sm font-bold text-ba-shiroko-palette-dark-2 mb-4">PILIH PAKET DATA</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {kuotaProducts[selectedProvider].items.map((product) => (
                <div
                  key={product.id}
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                    selectedProduct?.id === product.id
                      ? "border-ba-shiroko-palette-medium bg-blue-50/50 ring-4 ring-ba-shiroko-palette-light/20"
                      : "border-neutral-100 hover:border-ba-shiroko-palette-light bg-white"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  {selectedProduct?.id === product.id && (
                    <div className="absolute -top-2 -right-2 bg-ba-shiroko-palette-medium text-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                  <div>
                    <p className="font-black text-ba-shiroko-palette-dark-3 uppercase tracking-tight">{product.package_name}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-ba-shiroko-palette-medium">{product.data_amount}</span>
                    </div>
                    <p className="text-[10px] font-bold text-neutral-400 mt-1">MASA AKTIF: {product.validity_period.toUpperCase()}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-ba-shiroko-palette-dark-2">Rp {product.price.toLocaleString()}</p>
                    <span className="text-[9px] bg-ba-shiroko-palette-light/20 text-ba-shiroko-palette-medium px-2 py-0.5 rounded-full font-bold">PILIH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedProduct && (
          <div className="pt-2">
            <Button type="submit" className="w-full py-5 h-auto shadow-lg shadow-blue-200" disabled={loading}>
              <div className="flex items-center justify-center font-black text-lg tracking-wide">
                {loading ? "PROCESSING..." : <>
                  <span>BELI SEKARANG</span>
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
