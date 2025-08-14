import { useState } from "react";
import Input from "../components/meta/Input";
import Button from "../components/meta/Button";
import { useNavigate } from "react-router-dom";
import RequestAPIApp from "../lib/request";

const games = [
  {
    id: "genshin",
    name: "Genshin Impact",
    servers: ["asia", "america", "europe", "tw-hk-mo"],
    image: "/games/genshin.jpg",
    products: [
      { id: "gi1", name: "Genesis Crystal 60", price: 16000 },
      { id: "gi2", name: "Genesis Crystal 300+30", price: 79000 },
      { id: "gi3", name: "Genesis Crystal 980+110", price: 159000 },
      { id: "gi4", name: "Genesis Crystal 1980+260", price: 319000 },
    ]
  },
  {
    id: "starrail",
    name: "Honkai: Star Rail",
    servers: ["asia", "america", "europe", "tw-hk-mo"],
    image: "/games/starrail.jpg",
    products: [
      { id: "hsr1", name: "Oneiric Shard 60", price: 16000 },
      { id: "hsr2", name: "Oneiric Shard 300+30", price: 79000 },
      { id: "hsr3", name: "Oneiric Shard 980+110", price: 159000 },
      { id: "hsr4", name: "Oneiric Shard 1980+260", price: 319000 },
    ]
  },
  {
    id: "zzz",
    name: "Zenless Zone Zero",
    servers: ["asia", "america", "europe", "tw-hk-mo"],
    image: "/games/zzz.jpg",
    products: [
      { id: "zzz1", name: "Premium Currency 60", price: 16000 },
      { id: "zzz2", name: "Premium Currency 300+30", price: 79000 },
      { id: "zzz3", name: "Premium Currency 980+110", price: 159000 },
      { id: "zzz4", name: "Premium Currency 1980+260", price: 319000 },
    ]
  },
  {
    id: "arknights",
    name: "Arknights",
    servers: ["global"],
    image: "/games/arknights.jpg",
    products: [
      { id: "ark1", name: "Originium 60", price: 16000 },
      { id: "ark2", name: "Originium 90+12", price: 149000 },
      { id: "ark3", name: "Originium 185+25", price: 299000 },
      { id: "ark4", name: "Originium 375+50", price: 479000 },
    ]
  },
  {
    id: "bluearchive",
    name: "Blue Archive",
    servers: ["global", "japan"],
    image: "/games/bluearchive.jpg",
    products: [
      { id: "ba1", name: "Pyroxene 490", price: 79000 },
      { id: "ba2", name: "Pyroxene 1200+300", price: 149000 },
      { id: "ba3", name: "Pyroxene 2400+600", price: 299000 },
      { id: "ba4", name: "Pyroxene 4800+1200", price: 479000 },
    ]
  },
  // ...tambahkan game lainnya
];

export default function GameTransaction() {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [userId, setUserId] = useState("");
  const [server, setServer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedGame || !userId || !server || !selectedProduct) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await RequestAPIApp("/transactions", {
        method: "POST",
        data: {
          type: "game",
          amount: selectedProduct.price,
          payment_method: paymentMethod,
          details: {
            game_id: selectedGame.id,
            uid: userId,
            server: server,
            product: selectedProduct.name
          }
        }
      });

      if (response.data?.snap_token) {
        // Redirect ke halaman pembayaran atau tampilkan modal Midtrans
        window.snap.pay(response.data.snap_token);
      }
    } catch (error) {
      alert(error.message || "Failed to create transaction");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Game Top-up</h1>

      {/* Game Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {games.map((game) => (
          <div
            key={game.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedGame?.id === game.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
            onClick={() => {
              setSelectedGame(game);
              setServer("");
              setSelectedProduct(null);
            }}
          >
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <h3 className="text-center font-semibold">{game.name}</h3>
          </div>
        ))}
      </div>

      {selectedGame && (
        <>
          {/* User ID Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {selectedGame.id === "bluearchive" ? "Account ID" : "UID"}
            </label>
            <Input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
            />
          </div>

          {/* Server Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Server</label>
            <select
              className="w-full p-2 border rounded"
              value={server}
              onChange={(e) => setServer(e.target.value)}
            >
              <option value="">Select Server</option>
              {selectedGame.servers.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Product</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedGame.products.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedProduct?.id === product.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <h4 className="font-medium mb-2">{product.name}</h4>
                  <p className="text-blue-600">Rp {product.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              className="w-full p-2 border rounded"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="virtual_account">Virtual Account</option>
              <option value="ewallet">E-Wallet</option>
              <option value="qris">QRIS</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Continue to Payment"}
          </Button>
        </>
      )}
    </div>
  );
}
