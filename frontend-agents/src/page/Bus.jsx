import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../lib/request"
import { useAuthorization } from "../components/content/Authentication"
import { ArrowRight, Bus, Calendar } from "lucide-react"
import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"

const createBusValidate = new validate.Form("bus")
createBusValidate.append({
  from_city_id: validate.number("Kota Asal").require(),
  to_city_id: validate.number("Kota Tujuan").require(),
  date: validate.string("Tanggal").require(),
  quantity: validate.number("Jumlah Tiket").require().min(1).max(4)
})

export default function BusPage() {
  const [cities, setCities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [messageErr, setMessageErr] = useState({})
  const [routeInfo, setRouteInfo] = useState(null)
  const auth = useAuthorization()

  const loadCities = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/services/cities", {
        headers: auth.headers()
      })
      if (response.data?.data?.cities) {
        setCities(response.data.data.cities)
      }
    } catch {
      toast.error("Gagal memuat daftar kota", {
        description: "Silahkan coba lagi nanti"
      })
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  useEffect(() => {
    loadCities()
  }, [loadCities])

  async function handleSearch(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const data = Object.fromEntries(form)

    // Validate form
    const isValid = createBusValidate.validate(data)
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
      const response = await RequestAPIApp("/services/validate-bus-route", {
        method: "POST",
        headers: auth.headers(),
        data: {
          from_city_id: parseInt(data.from_city_id),
          to_city_id: parseInt(data.to_city_id),
          date: data.date,
        }
      })

      if (response.data?.available) {
        setRouteInfo({
          from_city_id: parseInt(data.from_city_id),
          to_city_id: parseInt(data.to_city_id),
          date: data.date,
          quantity: parseInt(data.quantity),
          price: response.data.price,
          available_seats: response.data.available_seats,
          departure_time: response.data.departure_time,
          arrival_time: response.data.arrival_time
        })
      }
    } catch (error) {
      toast.error("Gagal mencari rute", {
        description: error.response?.data?.message || "Silahkan coba lagi nanti"
      })
    }
  }

  async function handleBooking() {
    if (!routeInfo) return

    try {
      const response = await RequestAPIApp("/transactions", {
        method: "POST",
        headers: auth.headers(),
        data: {
          type: "bus",
          amount: routeInfo.price * routeInfo.quantity,
          payment_method: "bank_transfer",
          details: {
            from_city_id: routeInfo.from_city_id,
            to_city_id: routeInfo.to_city_id,
            date: routeInfo.date,
            quantity: routeInfo.quantity,
            price_per_ticket: routeInfo.price,
            departure_time: routeInfo.departure_time,
            arrival_time: routeInfo.arrival_time
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
      toast.error("Gagal membuat pemesanan", {
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
          <Bus className="w-8 h-8" />
          Tiket Bus
        </h1>
        <p className="text-gray-600 mt-2">
          Pesan tiket bus antar kota dengan mudah dan aman
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kota Asal</label>
            <select 
              name="from_city_id"
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Pilih Kota Asal</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.province}
                </option>
              ))}
            </select>
            {messageErr?.from_city_id && (
              <p className="text-red-500 text-sm mt-1">{messageErr.from_city_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kota Tujuan</label>
            <select 
              name="to_city_id"
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Pilih Kota Tujuan</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.province}
                </option>
              ))}
            </select>
            {messageErr?.to_city_id && (
              <p className="text-red-500 text-sm mt-1">{messageErr.to_city_id}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tanggal Keberangkatan"
            name="date"
            type="date"
            icon={<Calendar className="w-5 h-5" />}
            min={new Date().toISOString().split('T')[0]}
            error={messageErr?.date}
            required
          />

          <Input
            label="Jumlah Tiket"
            name="quantity"
            type="number"
            min="1"
            max="4"
            defaultValue="1"
            error={messageErr?.quantity}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          <span>Cari Tiket</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>

      {routeInfo && (
        <div className="mt-8 p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Informasi Rute</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Waktu Keberangkatan</p>
              <p className="font-medium">{routeInfo.departure_time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Waktu Kedatangan</p>
              <p className="font-medium">{routeInfo.arrival_time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Harga per Tiket</p>
              <p className="font-medium">Rp {routeInfo.price.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pembayaran</p>
              <p className="font-medium text-lg text-blue-600">
                Rp {(routeInfo.price * routeInfo.quantity).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <Button 
            onClick={handleBooking}
            className="w-full"
          >
            <span>Pesan Sekarang</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
