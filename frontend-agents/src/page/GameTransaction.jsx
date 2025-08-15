import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../lib/request"
import { useAuthorization } from "../components/content/Authentication"
import { ArrowRight, Gamepad2 } from "lucide-react"
import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"

const createGameValidate = new validate.Form("game")
createGameValidate.append({
  user_id: validate.string("User ID").require(),
  server: validate.string("Server").require(),
  product_id: validate.number("Produk Game").require()
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
  const auth = useAuthorization()

  const loadGameProducts = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/products/games", {
        headers: auth.headers(),
      })
      if (response.data?.data) {
        setGames(response.data.data.items)
        setGameNames(response.data.data.games)
        if (response.data.data.games.length > 0) {
          setSelectedGame(response.data.data.games[0])
        }
      }
    } catch {
      toast.error("Gagal memuat daftar produk game", {
        description: "Silahkan coba lagi nanti"
      })
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  useEffect(() => {
    loadGameProducts() // Run one
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedGame || !userId || !server || !selectedProduct) {
      toast.error("Harap lengkapi semua field yang diperlukan")
      return
    }

    // Validate form
    const data = { user_id: userId, server, product_id: selectedProduct.id }
    const isValid = createGameValidate.validate(data)
    if (isValid) {
      const parseErrorValid = HandleingValidateError(isValid)
      setMessageErr(parseErrorValid.context)
      toast.error("Ada beberapa yang perlu diubah", {
        description: parseErrorValid?.list[0]?.msg || "Unknowing"
      })
      return
    }
    setMessageErr({})

    try {
      const response = await RequestAPIApp("/transactions", {
        method: "POST",
        headers: auth.headers(),
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
    } catch (err) {
      toast.error("Gagal membuat transaksi", {
        description: err.response?.data?.message || "Silahkan coba lagi nanti"
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
          <Gamepad2 className="w-8 h-8" />
          Game Top-up
        </h1>
        <p className="text-gray-600 mt-2">
          Top up game favorit Anda dengan mudah dan cepat
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Game Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pilih Game
          </label>
          <div className="grid grid-cols-2 gap-3">
            {gameNames.map((gameName) => (
              <button
                key={gameName}
                type="button"
                onClick={() => setSelectedGame(gameName)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  selectedGame === gameName
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {gameName}
              </button>
            ))}
          </div>
      </div>

        {/* User ID and Server */}
        <div className="grid grid-cols-2 gap-4">
            <Input
            label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            placeholder="Masukkan User ID"
            error={messageErr?.user_id}
          />

          <Input
            label="Server"
              value={server}
              onChange={(e) => setServer(e.target.value)}
            placeholder="Global/Japan/Asia"
            error={messageErr?.server}
          />
          </div>

          {/* Product Selection */}
        {selectedGame && games[selectedGame] && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pilih Produk
            </label>
            <div className="grid grid-cols-2 gap-3">
              {games[selectedGame].items.map((product) => (
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
                    <p className="font-bold text-lg">{product.item_type}</p>
                    <p className="text-sm text-gray-600">{product.amount}</p>
                    <p className="text-lg font-semibold text-blue-600">
                      Rp {product.price.toLocaleString()}
                    </p>
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
            <span>Lanjutkan Pembayaran</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
      )}
      </form>
    </div>
  )
}
