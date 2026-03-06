import { useAuthorization } from "../components/content/Authentication"
import HeadOperation from "../components/content/HeadOperation"
import RequestAPIApp from "../lib/request"
import CanvasGenerateImagePicture from "../lib/canvas-generate-img"
import { useEffect, useState, useCallback } from "react"
import { User, Phone, MapPin, Wallet, BadgeCheck, ShieldAlert, Zap, History, ChevronRight, Star } from "lucide-react"
import Link from "../components/meta/Link"

export default function ProfileUser() {
  const author = useAuthorization()
  const [getProfile, setProfile] = useState({
    data: {}, loading: true
  })

  const GetProfileUser = useCallback(async () => {
    const pictureImg = CanvasGenerateImagePicture(400, 400)
    
    try {
      const request = await RequestAPIApp("/auth/me", { 
        headers: author.headers(),
        showErrorOnToast: false 
      })

      let profileData = null
      
      if (request.data?.status === "success" && request.data?.data) {
        profileData = request.data.data
      } else {
        profileData = author.getUser()
      }

      if (profileData) {
        setProfile({
          data: {
            profile: profileData.profile || pictureImg,
            username: profileData.name || 'Unknown User',
            phone: profileData.phone_number || 'N/A',
            address: profileData.address || 'Alamat belum diatur',
            balance: profileData.balance || 0,
            is_active: profileData.is_active,
            role: profileData.role
          },
          loading: false
        })
      } else {
        setProfile({ data: {}, loading: false })
      }
    } catch (e) {
      console.error("Failed to fetch profile", e)
      const localUser = author.getUser()
      if (localUser) {
        setProfile({
          data: {
            profile: localUser.profile || pictureImg,
            username: localUser.name || 'Unknown',
            phone: localUser.phone_number || 'N/A',
            address: localUser.address || 'N/A',
            balance: localUser.balance || 0,
            is_active: localUser.is_active,
            role: localUser.role
          },
          loading: false
        })
      } else {
        setProfile({ data: {}, loading: false })
      }
    }
  }, [author])

  useEffect(() => {
    if (author.isLogin) {
      GetProfileUser()
    } else {
      setProfile({ data: {}, loading: false })
    }
  }, [author.isLogin, GetProfileUser])

  if (!author.isLogin && !getProfile.loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={64} className="text-neutral-200 mb-4" />
        <h2 className="text-xl font-black text-ba-shiroko-palette-dark-2 uppercase tracking-tighter">Akses Dibatasi</h2>
        <p className="text-sm text-neutral-500 mt-2 max-w-xs">Silahkan masuk terlebih dahulu untuk melihat informasi profile anda.</p>
      </div>
    )
  }

  const getIsVerification = getProfile.loading ? "Memuat..." : getProfile.data?.is_active ? "TERVERIFIKASI" : "TIDAK AKTIF"
  const getVerifColor = getProfile.data?.is_active ? "text-emerald-500" : "text-rose-500"

  const quickMissions = [
    { label: "ISI PULSA", path: "/transaction/pulsa", icon: <Phone size={16} />, color: "bg-blue-500" },
    { label: "PAKET DATA", path: "/transaction/internet", icon: <Zap size={16} />, color: "bg-amber-500" },
    { label: "TOPUP GAME", path: "/transaction/game", icon: <Star size={16} />, color: "bg-purple-500" },
  ]

  return <>
    <HeadOperation title="AZStore - Profile Akun" />
    
    <div className="w-full max-w-4xl mx-auto p-4 py-8">
      {/* Header BA Style */}
      <div className="w-full mb-8">
        <div className="ba-headers-title-text flex items-center px-4 rounded-t-lg">
          <User className="w-5 h-5 mr-2 text-ba-shiroko-palette-medium" />
          <h1 className="font-black text-ba-shiroko-palette-dark-2 tracking-tighter uppercase">Profile Agen</h1>
        </div>
        <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-lg ba-headers-content-bg shadow-sm">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
            Informasi identitas dan kredensial akses operasional anda dalam sistem AZStore terminal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-ba-shiroko-palette-medium"></div>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-neutral-50 overflow-hidden shadow-lg">
                  {getProfile.loading ? (
                    <div className="w-full h-full bg-neutral-100 animate-pulse"></div>
                  ) : (
                    <img src={getProfile.data?.profile} className="w-full h-full object-cover" alt="Profile" />
                  )}
                </div>
                <div className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md">
                  <BadgeCheck size={24} className={getVerifColor} fill="currentColor" />
                </div>
              </div>
              
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Agent Rank</p>
              <h2 className="text-xl font-black text-ba-shiroko-palette-dark-3 uppercase tracking-tighter truncate w-full">
                {getProfile.loading ? "Loading..." : getProfile.data?.username}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-ba-shiroko-palette-light/10 rounded-full mt-2 border border-ba-shiroko-palette-light/20">
                <span className="text-[9px] font-black text-ba-shiroko-palette-medium uppercase tracking-tighter">Level 1 Agent</span>
              </div>
            </div>
            
            <div className="border-t border-neutral-100 p-4 space-y-3 bg-neutral-50/30">
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-ba-shiroko-palette-medium" />
                <span className="text-[10px] font-bold text-ba-shiroko-palette-dark-2 uppercase">{getProfile.data?.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-ba-shiroko-palette-medium mt-0.5" />
                <span className="text-[10px] font-bold text-neutral-500 uppercase leading-tight">{getProfile.data?.address}</span>
              </div>
            </div>
          </div>

          <div className="bg-ba-shiroko-palette-dark-2 rounded-xl p-5 text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="text-[10px] font-black text-ba-shiroko-palette-light uppercase tracking-[0.2em] mb-4">Account Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">Status</span>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase">Secure</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">2FA</span>
                <span className="text-[10px] font-black bg-white/10 text-neutral-400 px-2 py-0.5 rounded border border-white/10 uppercase">Off</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance & Verification Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm ba-headers-content-bg relative group overflow-hidden transition-all hover:border-ba-shiroko-palette-medium">
              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet size={80} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-ba-shiroko-palette-medium">
                  <Wallet size={20} />
                </div>
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Saldo Tersedia</h3>
              </div>
              <p className="text-3xl font-black text-ba-shiroko-palette-dark-3 tracking-tighter">
                {getProfile.loading ? "..." : `Rp ${Number(getProfile.data?.balance || 0).toLocaleString()}`}
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-end">
                <button className="text-[10px] font-black text-ba-shiroko-palette-medium uppercase tracking-tighter hover:underline">Tambah Saldo +</button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm ba-headers-content-bg relative group overflow-hidden transition-all hover:border-ba-shiroko-palette-medium">
              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <BadgeCheck size={80} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neutral-50 rounded-lg text-neutral-400">
                  <BadgeCheck size={20} className={getVerifColor} />
                </div>
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status Verifikasi</h3>
              </div>
              <p className={`text-xl font-black tracking-widest ${getVerifColor}`}>
                {getIsVerification}
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-[9px] font-bold text-neutral-400 uppercase">Akses: {getProfile.data?.role?.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Quick Missions (The 'Extra Something') */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-ba-shiroko-palette-dark-2 uppercase tracking-widest">Quick Missions</h2>
              <Zap size={14} className="text-ba-shiroko-palette-medium animate-pulse" />
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickMissions.map((mission, idx) => (
                <Link key={idx} href={mission.path} className="flex items-center justify-between p-4 rounded-lg border border-neutral-100 bg-white hover:border-ba-shiroko-palette-medium hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${mission.color} text-white flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform`}>
                      {mission.icon}
                    </div>
                    <span className="text-[10px] font-black text-ba-shiroko-palette-dark-2 tracking-tighter uppercase">{mission.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-neutral-300 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* Transaction Summary Placeholder */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-ba-shiroko-palette-dark-2 uppercase tracking-widest">Aktivitas Terakhir</h2>
              <History size={14} className="text-neutral-400" />
            </div>
            <div className="p-8 text-center ba-headers-content-bg">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-100 shadow-inner">
                <History size={24} className="text-neutral-300" />
              </div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-tight">Belum ada transaksi mission terbaru.</p>
              <Link href="/account/transaction-history" className="text-[10px] font-black text-ba-shiroko-palette-medium uppercase mt-4 inline-block hover:underline">Lihat Semua Riwayat</Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="w-full mt-12 pt-8 border-t border-neutral-100 text-center opacity-40">
        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.4em]">ABYDOS • SHIROKO • AZSTORE TERMINAL</p>
      </div>
    </div>
  </>
}
