import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../lib/request"
import { useAuthorization } from "../components/content/Authentication"
import { ArrowRight, Wallet } from "lucide-react"
import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"

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
  const auth = useAuthorization()

  const loadEWallets = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/services/e-wallets", {
        headers: auth.headers(),
      })
      if (response.data?.data?.ewallets) {
        setEwallets(response.data.data.ewallets)
      }
    } catch {
      toast.error("Gagal memuat daftar e-wallet", {
        description: "Silahkan coba lagi nanti"
      })
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  useEffect(() => {
    loadEWallets()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const data = Object.fromEntries(form)
    
    // Validate form
    const isValid = createEWalletValidate.validate(data)
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
          type: "ewallet",
          amount: parseInt(data.amount),
          payment_method: "bank_transfer",
          details: {
            product_id: parseInt(data.ewallet_id),
            phone_number: data.phone
          }
        }
      })

      if (response.data?.data?.snap_token) {
        // Redirect to payment
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
          <Wallet className="w-8 h-8" />
          Top Up E-Wallet
        </h1>
        <p className="text-gray-600 mt-2">
          Top up saldo e-wallet Anda dengan mudah dan aman
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {ewallets.map(wallet => (
            <div
              key={wallet.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedEwallet?.id === wallet.id 
                ? "border-blue-500 bg-blue-50" 
                : "hover:border-gray-400"
              }`}
              onClick={() => setSelectedEwallet(wallet)}
            >
              <input
                type="radio"
                name="ewallet_id"
                value={wallet.id}
                checked={selectedEwallet?.id === wallet.id}
                className="hidden"
              />
              <div className="h-12 w-auto flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-gray-600">{wallet.code}</span>
              </div>
              <p className="text-center font-medium">{wallet.name}</p>
            </div>
          ))}
        </div>

        {selectedEwallet && (
          <div className="space-y-4">
            <Input
              label="Nomor Telepon"
              name="phone"
              type="tel"
              placeholder="0812xxxxxxxx"
              error={messageErr?.phone}
            />

            <Input
              label="Nominal Top Up"
              name="amount"
              type="number"
              min="10000"
              step="1000"
              placeholder="Minimal Rp10.000"
              error={messageErr?.amount}
            />

            <Button type="submit" className="w-full">
              <span>Lanjutkan Pembayaran</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
