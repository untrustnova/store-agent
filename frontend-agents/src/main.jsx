import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "leaflet/dist/leaflet.css"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { toast } from "sonner"
// # Layout/Middleware React
import GlobalLayout from "./page/layout/GlobalLayout"
import AccountSidebar from "./page/layout/AccountSidebar"
// # Pages
import Homepage from "./page/Homepage"
import NotFound from "./page/+Not-Found"
import MustUseAuth from "./components/content/MustUseAuth"
import Login from "./page/Login"
import Register from "./page/Register"
import ProfileUser from "./page/Profile"
import GameTransaction from "./page/GameTransaction"
import PulsaPage from "./page/Pulsa"
import BusPage from "./page/Bus"
import EWalletPage from "./page/EWallet"
import TokenListrikPage from "./page/TokenListrik"

// Admin Components
import AdminLayout from "./page/admin/AdminLayout"
import AdminDashboard from "./page/admin/Dashboard"
import UsersManagement from "./page/admin/Users"

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      {/* Layout Root */}
      <Route element={<GlobalLayout />}>
        {/* Global */}
        <Route path="/" element={<Homepage />} />
        {/* Tidak Memelukan Authentikasi - Memiliki Aksi Authentikasi */}
        <Route element={
          <MustUseAuth
            havelogin={{
              fn: () => { // Callback Have Login Token!
                toast.success("Kamu sudah masuk, tidak perlu masuk/register kembali")
              },
              redirect: "/account" // Redirect
            }}
          />
        }>
          <Route path="/auth/login" element={<Login />} />        {/* Auth - Login */}
          <Route path="/auth/register" element={<Register />} />  {/* Auth - Register */}
        </Route>
        <Route path="*" element={<NotFound />} /> {/* 404 Page */}
        {/* Perlu Authentikasi */}
        <Route element={<MustUseAuth />}>
          {/* Bagian Pembayaran */}
          <Route path="/transaction/pulsa" element={<PulsaPage />} />    {/* Transaksi Pulsa */}
          <Route path="/transaction/bus" element={<BusPage />} />      {/* Transaksi Bus */}
          <Route path="/transaction/e-wallet" element={<EWalletPage />} /> {/* Transaksi E-Wallet */}
          <Route path="/transaction/internet" element={
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center p-8">
                <h1 className="text-2xl font-bold mb-4">🚧 Coming Soon</h1>
                <p className="text-gray-600 mb-4">Layanan internet sedang dalam pengembangan.</p>
                <button 
                  onClick={() => window.history.back()} 
                  className="text-blue-500 hover:underline"
                >
                  Kembali
                </button>
              </div>
            </div>
          } /> {/* Transaksi Internet - Coming Soon */}
          <Route path="/transaction/game" element={<GameTransaction />} />     {/* Transaksi Game */}
          <Route path="/transaction/token-listrik" element={<TokenListrikPage />} />      {/* Transaksi Token Listrik */}
          <Route path="/transaction/pln" element={<Navigate to="/transaction/token-listrik" replace />} />      {/* Redirect PLN ke Token Listrik */}
          {/* Bagian Akun */}
          <Route element={<AccountSidebar />}>
            <Route path="/account" element={<ProfileUser />} />                          {/* Account - Profile Users */}
            <Route path="/account/transaction-history" element={<ProfileUser />} />      {/* Account - History Transaction >> postman_collection.json (520) */}
            <Route path="/account/transaction-status/:slug" element={<ProfileUser />} /> {/* Account - Status Transaction >> postman_collection.json (533) */}
          </Route>
          {/* Bagian Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="transactions" element={
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-center p-8">
                  <h1 className="text-2xl font-bold mb-4">🚧 Coming Soon</h1>
                  <p className="text-gray-600 mb-4">Halaman transaksi admin sedang dalam pengembangan.</p>
                </div>
              </div>
            } />
            <Route path="settings" element={
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-center p-8">
                  <h1 className="text-2xl font-bold mb-4">🚧 Coming Soon</h1>
                  <p className="text-gray-600 mb-4">Halaman pengaturan admin sedang dalam pengembangan.</p>
                </div>
              </div>
            } />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
