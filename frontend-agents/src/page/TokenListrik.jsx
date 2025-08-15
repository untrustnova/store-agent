import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../lib/request"
import { useAuthorization } from "../components/content/Authentication"
import { ArrowRight, Zap } from "lucide-react"
import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"

const createTokenValidate = new validate.Form("token")
createTokenValidate.append({
  meter_number: validate.string("Nomor Meter").require().min(11).max(11),
  product_id: validate.number("Produk Token").require()
})

export default function TokenListrikPage() {
  const [tokenProducts, setTokenProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [messageErr, setMessageErr] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const auth = useAuthorization()

  const loadTokenProducts = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/products/token-listrik", {
        headers: auth.headers(),
      })
      if (response.data?.data?.tokens) {
        setTokenProducts(response.data.data.tokens)
      }
    } catch {
      toast.error("Gagal memuat daftar produk token", {
        description: "Silahkan coba lagi nanti"
      })
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  useEffect(() => {
    loadTokenProducts()
  }, [loadTokenProducts])

  async function handleCheckMeter(e) {
    e.preventDefault()
    const meterNumber = e.target.meter_number.value

    if (meterNumber.length !== 11) {
      setMessageErr({ meter_number: "Nomor meter harus 11 digit" })
      return
    }

    try {
      const response = await RequestAPIApp("/services/validate-token-meter", {
        method: "POST",
        headers: auth.headers(),
        data: { meter_number: meterNumber }
      })

      if (response.data?.valid) {
        setCustomerInfo({
          name: response.data.customer_name,
          address: response.data.customer_address,
          tariff: response.data.tariff
        })
        setMessageErr({})
      }
    } catch (error) {
      toast.error("Gagal mengecek nomor meter", {
        description: error.response?.data?.message || "Silahkan coba lagi nanti"
      })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const data = Object.fromEntries(form)
    
    if (!selectedProduct) {
      toast.error("Pilih produk token terlebih dahulu")
      return
    }

    // Validate form
    const isValid = createTokenValidate.validate(data)
    if (isValid) {
      const parseErrorValid = HandleingValidateError(isValid)
      setMessageErr(parseErrorValid.context)
      toast.error("Ada beberapa yang perlu diubah", {
        description: `Ada ${Object.keys(parseErrorValid.context).length} field yang perlu diperbaiki`
      })
      return
    }
    setMessageErr({})

    try {
      const response = await RequestAPIApp("/transactions", {
        method: "POST",
        headers: auth.headers(),
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
          <Zap className="w-8 h-8" />
          Token Listrik
        </h1>
        <p className="text-gray-600 mt-2">
          Beli token listrik PLN dengan mudah dan cepat
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Nomor Meter/ID Pelanggan"
            name="meter_number"
            type="text"
            placeholder="12345678901"
            maxLength={11}
            error={messageErr?.meter_number}
            onBlur={handleCheckMeter}
          />

          {customerInfo && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Informasi Pelanggan:</h3>
              <p>Nama: {customerInfo.name}</p>
              <p>Alamat: {customerInfo.address}</p>
              <p>Tarif/Daya: {customerInfo.tariff}</p>
            </div>
          )}
        </div>

        {/* Product Selection */}
        {customerInfo && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pilih Nominal Token
            </label>
            <div className="grid grid-cols-2 gap-3">
              {tokenProducts.map((token) => (
                <div
                  key={token.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?.id === token.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedProduct(token)}
                >
                  <input
                    type="radio"
                    name="product_id"
                    value={token.id}
                    checked={selectedProduct?.id === token.id}
                    className="hidden"
                  />
                  <div className="text-center">
                    <p className="font-bold text-lg">Rp {token.nominal.toLocaleString()}</p>
                    <p className="text-lg font-semibold text-blue-600">
                      Rp {token.price.toLocaleString()}
                    </p>
                    {token.description && (
                      <p className="text-xs text-gray-500 mt-1">{token.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedProduct && (
          <Button type="submit" className="w-full">
            <span>Lanjutkan Pembayaran</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </form>
    </div>
  )
}
