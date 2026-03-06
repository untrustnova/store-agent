import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../lib/request"
import { useAuthorization } from "../components/content/Authentication"
import { ArrowRight, Gamepad2, User, Globe, CheckCircle2 } from "lucide-react"
import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"
import HeadOperation from "../components/content/HeadOperation"

const createGameValidate = new validate.Form("game")
createGameValidate.append({
  user_id: validate.string("User ID").require(),
  server: validate.string("Server").require(),
})

export default function GameTransaction() {
  const [games, setGames] = useState({})
  const [gameNames, setGameNames] = useState([])
  const [selectedGame, setSelectedGame] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [userId, setUserId] = useState("")
  const [server, setServer] = useState("")
  const [messageErr, setMessageErr] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const auth = useAuthorization()

  const loadGameProducts = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/products/games")
      if (response.data?.data) {
        setGames(response.data.data.items)
        setGameNames(response.data.data.games)
        if (response.data.data.games.length > 0) {
          setSelectedGame(response.data.data.games[0])
        }
      }
    } catch {
      toast.error("Gagal memuat daftar produk game")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGameProducts()
    if (!window.snap) {
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', 'SB-Mid-client-vP-y_m_O-5e_x-x_');
      document.body.appendChild(script);
    }
  }, [loadGameProducts])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if(loading) return
    
    if (!selectedGame || !selectedProduct) {
      toast.error("Harap lengkapi semua field yang diperlukan")
      return
    }

    const structureForm = { user_id: userId, server }
    
    const isValid = createGameValidate.validate(structureForm)
    if (isValid) {
      const parseErrorValid = HandleingValidateError(isValid)
      setMessageErr(parseErrorValid.context)
      toast.error("Input tidak valid")
      return
    }
    
    setMessageErr({})
    setLoading(true)

    try {
      const response = await RequestAPIApp("/transactions", {
        method: "POST",
        data: {
          type: "game",
          amount: selectedProduct.price,
          payment_method: "bank_transfer",
          details: {
            product_id: selectedProduct.id,
            game_id: selectedGame,
            uid: userId,
            server: server
          }
        }
      })

      if (response.data?.data?.snap_token) {
        window.snap.pay(response.data.data.snap_token, {
          onSuccess: () => toast.success("Pembayaran sedang diproses!"),
          onPending: () => toast.info("Menunggu pembayaran anda."),
          onError: () => toast.error("Pembayaran gagal")
        })
      }
    } catch (err) {
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
      <HeadOperation title="AZStore - Game Top-up" />
      
      <div className="w-full mb-6">
        <div className="ba-headers-title-text flex items-center px-4 rounded-t-lg">
          <Gamepad2 className="w-5 h-5 mr-2 text-ba-shiroko-palette-medium" />
          <h1 className="font-bold text-ba-shiroko-palette-dark-2">Top Up Game</h1>
        </div>
        <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-lg ba-headers-content-bg shadow-sm">
          <p className="text-sm text-neutral-600">
            Top up game favorit anda dengan harga termurah dan proses instan 24 jam.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <p className="text-sm font-bold text-ba-shiroko-palette-dark-2 mb-4 uppercase tracking-tighter">1. Pilih Game</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {gameNames.map((gameName) => (
              <button
                key={gameName}
                type="button"
                onClick={() => {
                  setSelectedGame(gameName)
                  setSelectedProduct(null)
                }}
                className={`px-3 py-3 rounded-md text-xs font-black transition-all border-2 uppercase ${
                  selectedGame === gameName
                    ? "border-ba-shiroko-palette-medium bg-ba-shiroko-palette-medium text-white shadow-md"
                    : "border-neutral-50 bg-neutral-50 text-neutral-400 hover:border-ba-shiroko-palette-light"
                }`}
              >
                {gameName}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-ba-shiroko-palette-medium"></div>
          <p className="text-sm font-bold text-ba-shiroko-palette-dark-2 mb-4 uppercase tracking-tighter">2. Data Akun</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block w-full">
              <p className="mb-1 text-[10px] font-black text-neutral-400">USER ID</p>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                icon={<User size={16} className="text-ba-shiroko-palette-medium" />}
                placeholder="Masukkan ID"
                error={!!messageErr?.user_id}
              />
            </label>
            <label className="block w-full">
              <p className="mb-1 text-[10px] font-black text-neutral-400">SERVER</p>
              <Input
                value={server}
                onChange={(e) => setServer(e.target.value)}
                icon={<Globe size={16} className="text-ba-shiroko-palette-medium" />}
                placeholder="Global/Asia/..."
                error={!!messageErr?.server}
              />
            </label>
          </div>
        </div>

        {selectedGame && games[selectedGame] && (
          <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm ba-headers-content-bg">
            <p className="text-sm font-bold text-ba-shiroko-palette-dark-2 mb-4 uppercase tracking-tighter">3. Pilih Nominal</p>
            <div className="grid grid-cols-2 gap-3">
              {games[selectedGame].items.map((product) => (
                <div
                  key={product.id}
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col justify-center items-center text-center ${
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
                  <p className="font-black text-ba-shiroko-palette-dark-3 uppercase text-xs">{product.item_type}</p>
                  <p className="text-lg font-black text-ba-shiroko-palette-medium my-1">{product.amount}</p>
                  <div className="w-full h-[1px] bg-neutral-100 my-2"></div>
                  <p className="text-[10px] font-bold text-neutral-500">Rp {product.price.toLocaleString()}</p>
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
                  <span>KONFIRMASI TOP UP</span>
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
