import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "leaflet/dist/leaflet.css"
import { BrowserRouter, Routes, Route } from "react-router"
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
        {/* Perlu Authentikasi */}
        <Route element={<MustUseAuth />}>
          {/* Bagian Pembayaran */}
          <Route path="/transaction/pulsa" element={<></>} />    {/* Transaksi Pulsa >> postman_collection.json (87) */}
          <Route path="/transaction/bus" element={<></>} />      {/* Transaksi Bus >> postman_collection.json (119) */}
          <Route path="/transaction/e-wallet" element={<></>} /> {/* Transaksi E-Wallet >> postman_collection.json (152) */}
          <Route path="/transaction/internet" element={<></>} /> {/* Transaksi Internet >> postman_collection.json (181) */}
          <Route path="/transaction/game" element={<></>} />     {/* Transaksi Game >> postman_collection.json (211,242,273,304,335,366,397,428,459) */}
          <Route path="/transaction/pln" element={<></>} />      {/* Transaksi PLN >> postman_collection.json (490) */}
          {/* Bagian Akun */}
          <Route element={<AccountSidebar />}>
            <Route path="/account" element={<ProfileUser />} />                          {/* Account - Profile Users */}
            <Route path="/account/transaction-history" element={<ProfileUser />} />      {/* Account - History Transaction >> postman_collection.json (520) */}
            <Route path="/account/transaction-status/:slug" element={<ProfileUser />} /> {/* Account - Status Transaction >> postman_collection.json (533) */}
          </Route>
          {/* Bagian Admin */}
          <Route path="/admin" element={<></>} />
          <Route path="/admin/users" element={<></>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
