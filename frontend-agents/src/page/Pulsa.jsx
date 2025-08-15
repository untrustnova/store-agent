import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../lib/request"
import { useAuthorization } from "../components/content/Authentication"
import { ArrowRight, Phone } from "lucide-react"
import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"

const createPulsaValidate = new validate.Form("pulsa")
createPulsaValidate.append({
  phone: validate.string("Nomor Telepon").require().min(10).max(15),
  product_id: validate.number("Produk Pulsa").require()
})

export default function PulsaPage() {
  const [pulsaProducts, setPulsaProducts] = useState({})
  const [providers, setProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [messageErr, setMessageErr] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const auth = useAuthorization()

  const loadPulsaProducts = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/products/pulsa", {
        headers: auth.headers(),
      })
      if (response.data?.data) {
        setPulsaProducts(response.data.data.pulsa)
        setProviders(response.data.data.providers)
        if (response.data.data.providers.length > 0) {
          setSelectedProvider(response.data.data.providers[0])
        }
      }
    } catch {
      toast.error("Gagal memuat daftar produk pulsa", {
        description: "Silahkan coba lagi nanti"
      })
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  useEffect(() => {
    loadPulsaProducts()
  }, [])

  async function handleSubmit(e) {
    if(loading) return;
    e.preventDefault()
    const form = new FormData(e.target)
    const data = Object.fromEntries(form)
    
    if (!selectedProduct) {
      toast.error("Pilih produk pulsa terlebih dahulu")
      return
    }

    // Validate form
    const isValid = createPulsaValidate.validate({
      phone: String(data?.phone||""),
      product_id: parseInt(data||"0")
    })
    if (isValid) {
      const parseErrorValid = HandleingValidateError(isValid)
      setMessageErr(parseErrorValid.context)
      toast.error("Ada beberapa yang perlu diubah", {
        description: parseErrorValid?.list[0]?.msg || "Unknowing"
      })
      return
    }
    setMessageErr({})

    setLoading(true)
    try {
      const response = await RequestAPIApp("/transactions", {
        method: "POST",
        headers: auth.headers(),
        data: {
          type: "pulsa",
          amount: selectedProduct.price,
          payment_method: "bank_transfer",
          details: {
            product_id: selectedProduct.id,
            phone_number: data.phone
          }
        }
      })

      if (response.data?.data?.snap_token) {
        window.snap.pay(response.data.data.snap_token, {
          onSuccess: function() {
            toast.success("Pembayaran berhasil!")
            // Redirect to history or dashboard
          },
          onError: function() {
            toast.error("Pembayaran gagal", {
              description: "Silahkan coba lagi"
            })
          }
        })
      }
    } catch (error) {
      toast.error("Gagal membuat transaksi", {
        description: error.response?.data?.message || "Silahkan coba lagi nanti"
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Phone className="w-8 h-8" />
          Pulsa
        </h1>
        <p className="text-gray-600 mt-2">
          Isi pulsa dengan mudah dan instant
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Nomor Telepon"
          name="phone"
          type="tel"
          placeholder="0812xxxxxxxx"
          error={messageErr?.phone}
        />

        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Provider
          </label>
          <div className="grid grid-cols-3 gap-2">
            {providers.map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => setSelectedProvider(provider)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  selectedProvider === provider
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        {/* Product Selection */}
        {selectedProvider && pulsaProducts[selectedProvider] && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pilih Nominal Pulsa
            </label>
            <div className="grid grid-cols-2 gap-3">
              {pulsaProducts[selectedProvider].items.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <input
                    type="radio"
                    name="product_id"
                    value={product.id}
                    checked={selectedProduct?.id === product.id}
                    className="hidden"
                  />
                  <div className="text-center">
                    <p className="font-bold text-lg">Rp {product.nominal.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Rp {product.price.toLocaleString()}</p>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedProduct && (
          <Button type="submit" className="w-full">
            <div className="flex items-center font-semibold">
              {loading? <>
                <span>Loading...</span>
              </>:<>
                <span>Lanjutkan Pembayaran</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </>}
            </div>
          </Button>
        )}
      </form>
    </div>
  )
}
