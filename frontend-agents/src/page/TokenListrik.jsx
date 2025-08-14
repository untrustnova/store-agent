import { useState } from "react"
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
  amount: validate.number("Nominal Token").require()
})

const TOKEN_OPTIONS = [
  { amount: 20000, label: "20,000", kwh: "13,2 kWh" },
  { amount: 50000, label: "50,000", kwh: "33 kWh" },
  { amount: 100000, label: "100,000", kwh: "66 kWh" },
  { amount: 200000, label: "200,000", kwh: "132 kWh" },
  { amount: 500000, label: "500,000", kwh: "330 kWh" },
  { amount: 1000000, label: "1,000,000", kwh: "660 kWh" },
]

export default function TokenListrikPage() {
  const [messageErr, setMessageErr] = useState({})
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const auth = useAuthorization()

  async function handleCheckMeter(e) {
    e.preventDefault()
    const meterNumber = e.target.meter_number.value

    if (meterNumber.length !== 11) {
      setMessageErr({ meter_number: "Nomor meter harus 11 digit" })
      return
    }

    try {
      const response = await RequestAPIApp("/transaction/check-meter", {
        method: "POST",
        headers: auth.headers(),
        data: { meter_number: meterNumber }
      })

      if (response.data?.data?.customer) {
        setCustomerInfo(response.data.data.customer)
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
    const data = {
      ...Object.fromEntries(form),
      amount: selectedAmount
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
      const response = await RequestAPIApp("/transaction/topup/token", {
        method: "POST",
        headers: auth.headers(),
        data: {
          meter_number: data.meter_number,
          amount: data.amount
        }
      })

      if (response.data?.data?.snap_token) {
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
              <p>Tarif/Daya: {customerInfo.power_rate}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Pilih Nominal</label>
          <div className="grid grid-cols-2 gap-3">
            {TOKEN_OPTIONS.map(option => (
              <div
                key={option.amount}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAmount === option.amount 
                  ? "border-blue-500 bg-blue-50" 
                  : "hover:border-gray-400"
                }`}
                onClick={() => setSelectedAmount(option.amount)}
              >
                <p className="font-medium">Rp {option.label}</p>
                <p className="text-sm text-gray-600">{option.kwh}</p>
              </div>
            ))}
          </div>
          {messageErr?.amount && (
            <p className="text-red-500 text-sm mt-1">{messageErr.amount}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={!customerInfo || !selectedAmount}
        >
          <span>Beli Token</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>
    </div>
  )
}
