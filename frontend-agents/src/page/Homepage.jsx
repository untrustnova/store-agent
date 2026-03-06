import globalPathOrigin from "../components/meta/global-path"
import Link from "../components/meta/Link"
import HeadOperation from "../components/content/HeadOperation"
import { Sparkles, TrendingUp, ShieldCheck, Zap, ArrowRight } from "lucide-react"

export default function Homepage() {
  return <>
    <HeadOperation
      title="AZStore - Schale's Digital Supply"
    />
    
    {/* Hero Section - BA Style */}
    <div className="w-full bg-ba-shiroko-palette-medium relative overflow-hidden mb-8">
      <div className="absolute inset-0 ba-headers-content-bg opacity-30"></div>
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 relative z-10 flex flex-col md:flex-row items-center justify-between">
        <div className="text-white md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-widest mb-4 uppercase">
            <Sparkles size={14} /> Digital Supply Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-none">
            EVERYDAY <br/> IS A MISSION
          </h1>
          <p className="text-ba-shiroko-palette-white font-bold text-sm md:text-base max-w-md opacity-90 uppercase tracking-tight">
            Top up favoritmu, selesaikan misimu. <br/> Cepat, Aman, dan Terpercaya ala Abydos.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            <Link href="/transaction/pulsa" className="bg-white text-ba-shiroko-palette-medium px-8 py-3 rounded-md font-black text-sm uppercase shadow-lg hover:bg-ba-shiroko-palette-white transition-all transform hover:-translate-y-1 active:scale-95">
              Mulai Belanja
            </Link>
          </div>
        </div>
        <div className="md:w-1/3 flex justify-center">
          <div className="relative">
            <div className="w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full border-4 border-white/20 flex items-center justify-center backdrop-blur-sm animate-pulse">
              <Zap size={80} className="text-white" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-xl rotate-12">
              <p className="text-ba-shiroko-palette-medium font-black text-xl tracking-tighter italic">24/7 FAST</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 w-full h-4 bg-white/10 skew-y-1"></div>
    </div>

    <div className="w-full max-w-5xl mx-auto px-4 pb-20">
      {/* Features Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="bg-white p-4 rounded-lg border border-neutral-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-ba-shiroko-palette-medium">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="font-black text-xs text-ba-shiroko-palette-dark-2 uppercase tracking-tighter">Harga Kompetitif</p>
            <p className="text-[10px] text-neutral-400 font-bold uppercase">Termurah di distrik ini</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="font-black text-xs text-ba-shiroko-palette-dark-2 uppercase tracking-tighter">Keamanan Terjamin</p>
            <p className="text-[10px] text-neutral-400 font-bold uppercase">Enkripsi ala Schale</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
            <Zap size={24} />
          </div>
          <div>
            <p className="font-black text-xs text-ba-shiroko-palette-dark-2 uppercase tracking-tighter">Proses Instan</p>
            <p className="text-[10px] text-neutral-400 font-bold uppercase">Kilat secepat Shiroko</p>
          </div>
        </div>
      </div>

      {/* Main Categories */}
      {globalPathOrigin.map((linked, i) => (
        <div className="w-full mb-10" key={`type-${i}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 bg-ba-shiroko-palette-medium rounded-full"></div>
            <h2 className="font-black text-xl text-ba-shiroko-palette-dark-3 tracking-tighter uppercase">{linked.label}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {linked.links.map((items, z) => (
              <Link className="group" key={`items-${z}`} href={items.path}>
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-ba-shiroko-palette-medium transition-all duration-200 overflow-hidden h-full flex flex-col">
                  <div className="p-1 h-1.5 bg-neutral-50 group-hover:bg-ba-shiroko-palette-medium transition-colors"></div>
                  <div className="p-5 flex items-center flex-1 ba-headers-content-bg">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-inner" style={{ background: items.bgColor, color: items.fnColor }}>
                      <span className="scale-110">{items.icon}</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-black text-ba-shiroko-palette-dark-2 text-base group-hover:text-ba-shiroko-palette-medium transition-colors uppercase tracking-tight leading-tight">
                        {items.label}
                      </h3>
                      <p className="text-[11px] font-bold text-neutral-400 mt-1 uppercase tracking-tighter leading-tight">
                        {items.text}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-ba-shiroko-palette-light group-hover:text-white transition-all">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      
      {/* BA Style Banner at bottom */}
      <div className="w-full mt-12 bg-ba-shiroko-palette-dark-2 rounded-2xl p-8 relative overflow-hidden shadow-xl border-b-8 border-ba-shiroko-palette-medium">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ba-shiroko-palette-medium/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 text-center">
          <h3 className="text-white font-black text-2xl mb-2 tracking-tighter italic uppercase">Siap Untuk Melakukan Transaksi?</h3>
          <p className="text-neutral-400 font-bold text-xs uppercase tracking-widest mb-6">Layanan kami tersedia 24 jam setiap hari tanpa libur</p>
          <div className="flex justify-center gap-4">
            <div className="px-4 py-2 bg-ba-shiroko-palette-dark-3 rounded text-[10px] font-black text-ba-shiroko-palette-light tracking-widest border border-ba-shiroko-palette-light/20 uppercase">
              Operational Status: Normal
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}
