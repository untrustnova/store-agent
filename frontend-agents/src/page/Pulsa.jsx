import { useState } from "react"
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
  amount: validate.number("Nominal Pulsa").require()
})

const PULSA_OPTIONS = [
  { amount: 5000, label: "5,000" },
  { amount: 10000, label: "10,000" },
  { amount: 20000, label: "20,000" },
  { amount: 25000, label: "25,000" },
  { amount: 50000, label: "50,000" },
  { amount: 100000, label: "100,000" },
]
const INTERNET_OPTIONS = [
  {  }
]

export default function PulsaPage() {
  const [messageErr, setMessageErr] = useState({})
  const [selectedAmount, setSelectedAmount] = useState(null)
  const auth = useAuthorization()

  async function handleSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const data = {
      ...Object.fromEntries(form),
      amount: selectedAmount
    }

    // Validate form
    const isValid = createPulsaValidate.validate(data)
    console.log(isValid)
    if (isValid) {
      const parseErrorValid = HandleingValidateError(isValid)
      setMessageErr(parseErrorValid.context)
      toast.error("Ada beberapa yang perlu diubah", {
        description: parseErrorValid?.list[0]?.msg||"Unknowing"
        // description: `Ada ${Object.keys(parseErrorValid.context).length} field yang perlu diperbaiki`
      })
      return
    }
    setMessageErr({})

    try {
      const response = await RequestAPIApp("/transactions", {
        method: "POST",
        headers: auth.headers(),
        data: {
          type: "pulsa",
          phone: data.phone,
          amount: data.amount,
          payment_method: "bank_transfer",
          details: {
						phone_number: data.phone,
						provider: "telkomsel"
					}
        }
      })

      if (response.data.data.snap_token) {
        window.snap.pay(response.data.data.snap_token, {
          onSuccess: function(result) {
            toast.success("Pembayaran berhasil!")
            // Redirect to history or dashboard
          },
          onError: function(result) {
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

        <div className="space-y-2">
          <label className="block text-sm font-medium">Pilih Nominal</label>
          <div className="grid grid-cols-3 gap-3">
            {PULSA_OPTIONS.map(option => (
              <div
                key={option.amount}
                className={`p-3 border rounded-lg text-center cursor-pointer transition-colors ${
                  selectedAmount === option.amount 
                  ? "border-blue-500 bg-blue-50" 
                  : "hover:border-gray-400"
                }`}
                onClick={() => setSelectedAmount(option.amount)}
              >
                <p className="font-medium">Rp {option.label}</p>
              </div>
            ))}
          </div>
          {messageErr?.amount && (
            <p className="text-red-500 text-sm mt-1">{messageErr.amount}</p>
          )}
        </div>

        <Button type="submit" className="w-full font-semibold">
          <div className="flex items-center py-1">
            <span>Beli Pulsa</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </div>
        </Button>
      </form>
    </div>
  )
}
