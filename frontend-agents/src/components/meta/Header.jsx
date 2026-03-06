import { BookOpenIcon, BoxesIcon, GlobeLockIcon, HistoryIcon, HomeIcon, LogOutIcon, MenuIcon, PhoneIcon, User2Icon, X, Zap, LayoutDashboard, Settings, CheckCircle2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import Link from "./Link"
import globalPathOrigin from "./global-path"
import { useAuthorization } from "../content/Authentication"
import RequestAPIApp from "../../lib/request"
import { toast } from "sonner"
import CanvasGenerateImagePicture from "../../lib/canvas-generate-img"

function Header_LinkProfile({ label, icon, text, path, showCaseBorder = false, closeSection, color = "", onclick }) {
  const handleClick = (e) => {
    if (onclick) {
      e.preventDefault()
      onclick()
    }
    if (closeSection) closeSection()
  }

  return <Link className="w-full flex items-center cursor-pointer group hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0" href={path} onClick={handleClick}>
    <div className="w-[60px] h-[60px] flex items-center justify-center">
      <div className={`w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center group-hover:scale-110 duration-200 ${color === 'rose' ? 'text-rose-500' : color === 'blue' ? 'text-blue-500' : 'text-ba-shiroko-palette-medium'}`}>
        {icon}
      </div>
    </div>
    <div className="w-[calc(100%-60px)] py-3 pr-4 flex flex-col justify-center">
      <h1 className="font-black text-ba-shiroko-palette-dark-2 text-xs uppercase tracking-tighter group-hover:text-ba-shiroko-palette-medium transition-colors">{label}</h1>
      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight truncate">{text}</p>
    </div>
  </Link>
}

function Header_GroupLink({ label, showLabel = true, links = [], closeSection }) {
  const linkContainList = Array.isArray(links)? links.filter(a => (
    !!a.text && !!a.label && !!a.icon &&
    !!a.path && typeof (a.text && a.label && a.path) === "string")
  ) : []

  if (linkContainList.length === 0) return null;

  return <div className="w-full mb-4">
    {showLabel&&<div className="w-full px-5 py-2">
      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</span>
    </div>}
    <div className="bg-white w-full shadow-sm border-y border-neutral-100 overflow-hidden">
      {linkContainList.map((linked, i) => (
        <Header_LinkProfile
          closeSection={closeSection}
          key={i}
          label={linked.label}
          icon={linked.icon}
          text={linked.text}
          path={linked.path}
          color={linked.color}
          onclick={linked.onclick}
        />
      ))}
    </div>
  </div>
}

export default function Header() {
  const author = useAuthorization()
  const [isOpen, setIsOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const topRecommendList = globalPathOrigin.flatMap(a =>
    a.links.filter(l => l.topRecommend)
  ).slice(0, 3)

  const user = author.getUser()
  const isAdmin = user?.role === 'admin'

  const dataNavigateWithLogin =  {
    label: "Akun Saya",
    showLabel: true,
    links: [
      {
        icon: <User2Icon size={18} />,
        label: "Profile",
        text: "Informasi akun anda",
        path: "/account"
      },
      {
        icon: <HistoryIcon size={18} />,
        label: "Riwayat",
        text: "Riwayat transaksi & top up",
        path: "/account/transaction-history"
      },
      ...(isAdmin ? [{
        icon: <LayoutDashboard size={18} />,
        label: "Admin Panel",
        text: "Manajemen sistem & supply",
        path: "/admin",
        color: "blue"
      }] : []),
      {
        icon: <LogOutIcon size={18} />,
        color: "rose",
        label: "Keluar",
        text: "Akhiri sesi mission",
        path: "/auth/login",
        onclick: () => author.RemoveAuth({ useRedirect: true })
      },
    ]
  }

  const dataNavigate = [
    {
      label: "Informasi",
      showLabel: true,
      links: [
        {
          icon: <PhoneIcon size={18} />,
          label: "Bantuan",
          text: "Dukungan layanan supply",
          path: "/help-services"
        },
        {
          icon: <GlobeLockIcon size={18} />,
          label: "Privasi",
          text: "Penggunaan data & keamanan",
          path: "/privacy"
        },
        {
          icon: <BookOpenIcon size={18} />,
          label: "Ketentuan",
          text: "Aturan operasional supply",
          path: "/terms"
        },
      ]
    }
  ]

  return <>
    <header className="sticky top-0 left-0 w-full h-[55px] bg-ba-shiroko-palette-medium border-b-4 border-ba-shiroko-palette-medium-2 flex items-center text-white shadow-xl z-50">
      <button className="w-[60px] h-full flex items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsOpen(true)}>
        <MenuIcon />
      </button>
      <div className="w-[calc(100%-60px)] flex items-center justify-between px-4">
        <Link href="/" className="group">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-ba-shiroko-palette-medium shadow-inner transform -skew-x-12">
              <Zap size={20} fill="currentColor" />
            </div>
            <b className="font-black text-xl tracking-tighter uppercase italic group-hover:tracking-normal transition-all duration-300">AZStore</b>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {topRecommendList.map((a, i) => (
            <Link href={a.path} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 flex items-center cursor-pointer max-md:hidden border border-white/10 transition-all" key={i}>
              <span className="mr-2">{a.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{a.label}</span>
            </Link>
          ))}
          <button className="px-3 py-1.5 rounded bg-ba-shiroko-palette-dark-2 hover:bg-ba-shiroko-palette-dark flex items-center cursor-pointer transition-all border border-ba-shiroko-palette-dark-3 shadow-lg ml-2" onClick={() => setShowMenu(true)}>
            <BoxesIcon size={18} className="mr-2 text-ba-shiroko-palette-light" />
            <span className="text-[10px] font-black uppercase tracking-widest">Supply Menu</span>
          </button>
        </div>
      </div>
    </header>

    {/* Sidebar Navigation */}
    <div
      className={`fixed top-0 left-0 w-full h-full bg-ba-shiroko-palette-dark/60 z-[60] transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={() => setIsOpen(false)}
    ></div>
    
    <nav
      className={`fixed top-0 left-0 w-full max-w-[320px] h-full bg-ba-shiroko-palette-white z-[70] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="ba-headers-title-text flex items-center justify-between px-5 shrink-0">
        <h2 className="font-black text-ba-shiroko-palette-dark-2 tracking-tighter uppercase text-sm">Operation Menu</h2>
        <button onClick={() => setIsOpen(false)} className="text-ba-shiroko-palette-dark-2 hover:bg-neutral-100 p-1 rounded-full transition-colors">
          <X size={20}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 ba-headers-content-bg">
        {/* Profile Card in Sidebar */}
        <div className="px-4 mb-6">
          {author.isLoading ? (
            <div className="w-full h-20 bg-neutral-50 rounded-xl animate-pulse"></div>
          ) : (
            <Link className="w-full p-4 rounded-xl bg-white border-2 border-ba-shiroko-palette-light/20 shadow-sm flex items-center gap-4 group hover:border-ba-shiroko-palette-medium transition-all" href={author.isLogin ? "/account" : "/auth/login"} onClick={() => setIsOpen(false)}>
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-2 border-ba-shiroko-palette-medium overflow-hidden bg-neutral-50 shadow-inner">
                  <img src={user?.profile || "/guest-user.webp"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                {author.isLogin && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                  <CheckCircle2 size={10} fill="currentColor" />
                </div>}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Status: {author.isLogin ? 'Online' : 'Offline'}</p>
                <h3 className="font-black text-ba-shiroko-palette-dark-2 uppercase tracking-tighter truncate leading-tight">
                  {user?.name || "GUEST AGENT"}
                </h3>
                <p className="text-[10px] font-bold text-ba-shiroko-palette-medium uppercase mt-1">
                  {author.isLogin ? `Access: ${user?.role?.toUpperCase()}` : "Klik untuk masuk"}
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Dynamic Groups */}
        {author.isLogin && (
          <Header_GroupLink links={dataNavigateWithLogin.links} label={dataNavigateWithLogin.label} showLabel={dataNavigateWithLogin.showLabel} closeSection={() => setIsOpen(false)} />
        )}
        
        {globalPathOrigin.map((group, i) => (
          <Header_GroupLink key={i} links={group.links} label={group.label} showLabel={true} closeSection={() => setIsOpen(false)} />
        ))}

        {dataNavigate.map((group, i) => (
          <Header_GroupLink key={i} links={group.links} label={group.label} showLabel={true} closeSection={() => setIsOpen(false)} />
        ))}
        
        <div className="mt-8 px-6 pb-10 text-center">
          <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em]">AZStore Terminal v0.05.0</p>
          <p className="text-[8px] font-bold text-neutral-300 uppercase mt-1 tracking-widest">© ABYDOS DISTRICT SUPPLY HUB</p>
        </div>
      </div>
    </nav>

    {/* Supply Menu Popup */}
    <div
      className={`fixed w-full h-full top-0 left-0 z-[80] flex items-center justify-center p-4 transition-all duration-300 ${showMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="absolute inset-0 bg-ba-shiroko-palette-dark/80 backdrop-blur-md" onClick={() => setShowMenu(false)}></div>
      
      <div className={`w-full max-w-2xl bg-ba-shiroko-palette-white rounded-xl shadow-2xl overflow-hidden relative z-[90] transition-transform duration-300 ${showMenu ? 'scale-100' : 'scale-95'}`}>
        <div className="ba-headers-title-text flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <BoxesIcon size={18} className="text-ba-shiroko-palette-medium" />
            <h2 className="font-black text-ba-shiroko-palette-dark-2 tracking-tighter uppercase">Supply Management System</h2>
          </div>
          <button onClick={() => setShowMenu(false)} className="hover:bg-neutral-100 p-1 rounded-full transition-colors">
            <X size={20}/>
          </button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto p-6 ba-headers-content-bg">
          {globalPathOrigin.map((menucard, i) => (
            <div key={i} className="mb-8 last:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-1 bg-ba-shiroko-palette-medium rounded-full"></div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{menucard.label}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {menucard.links.map((carditem, idx) => (
                  <Link href={carditem.path} key={idx} className="flex items-center p-3 bg-white rounded-lg border border-neutral-100 shadow-sm hover:border-ba-shiroko-palette-medium hover:shadow-md transition-all group" onClick={() => setShowMenu(false)}>
                    <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center text-ba-shiroko-palette-medium group-hover:bg-ba-shiroko-palette-medium group-hover:text-white transition-all duration-300">
                      {carditem.icon}
                    </div>
                    <div className="ml-3 overflow-hidden text-left">
                      <h3 className="font-black text-ba-shiroko-palette-dark-2 text-[11px] uppercase tracking-tighter leading-tight">{carditem.label}</h3>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase truncate leading-tight mt-0.5">{carditem.text}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-neutral-50 p-4 border-t border-neutral-100 flex justify-between items-center px-6">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest italic">Authorized Supply Terminal</p>
          <button onClick={() => setShowMenu(false)} className="text-[10px] font-black text-ba-shiroko-palette-medium hover:underline uppercase tracking-tighter">Close Terminal</button>
        </div>
      </div>
    </div>
  </>
}
