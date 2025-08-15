import { BoxesIcon, BusIcon, ChartAreaIcon, CreditCardIcon, GamepadIcon, GlobeIcon, MapPinIcon, PercentIcon, PhoneIcon, ReceiptIcon, SmartphoneIcon, WalletIcon, ZapIcon } from "lucide-react"

const globalPathOrigin = [
  {
    label: "Transaksi - Pesan / Top Up",
    links: [
      {
        icon: <SmartphoneIcon size={18} />,
        label: "Pulsa",
        text: "Isi ulang pulsa",
        topRecommend: true,
        bgColor: "#892eff",
        fnColor: "white",
        path: "/transaction/pulsa"
      },
      {
        icon: <BoxesIcon size={18} />,
        label: "E-Wallet",
        text: "Top up e-wallet",
        topRecommend: true,
        bgColor: "#45a8ff",
        fnColor: "white",
        path: "/transaction/e-wallet"
      },
      {
        icon: <GamepadIcon size={18} />,
        label: "Game",
        text: "Top up game",
        topRecommend: true,
        bgColor: "#2e69ff",
        fnColor: "white",
        path: "/transaction/game"
      },
      {
        icon: <GlobeIcon size={18} />,
        label: "Bus",
        text: "Tiket bus",
        bgColor: "#ff962e",
        fnColor: "white",
        path: "/transaction/bus"
      },
      {
        icon: <ZapIcon size={18} />,
        label: "Token Listrik",
        text: "Beli token listrik",
        bgColor: "#892eff",
        fnColor: "white",
        path: "/transaction/token-listrik"
      },
      {
        icon: <GlobeIcon size={18} />,
        label: "Internet",
        text: "Paket data internet",
        bgColor: "#24cbd1",
        fnColor: "white",
        path: "/transaction/internet"
      }
      // {
      //   icon: <SmartphoneIcon />,
      //   label: "Pesan Pulsa",
      //   text: "Pesan tiket bus mudah dan cepat",
      //   path: "/transaction/bus",
      //   topRecommend: true,
      //   bgColor: "#892eff",
      //   fnColor: "white",
      // },
      // {
      //   icon: <BusIcon />,
      //   label: "Pesan Bus",
      //   text: "Pesan tiket bus mudah dan cepat",
      //   path: "/transaction/bus",
      //   bgColor: "#45a8ff",
      //   fnColor: "white",
      // },
      // {
      //   icon: <WalletIcon />,
      //   label: "Top Up E-wallet",
      //   text: "Pesan tiket bus mudah dan cepat",
      //   path: "/transaction/e-wallet",
      //   topRecommend: true,
      //   bgColor: "#2e69ff",
      //   fnColor: "white",
      // },
      // {
      //   icon: <GlobeIcon />,
      //   label: "Top Up Internet",
      //   text: "Pesan tiket bus mudah dan cepat",
      //   path: "/transaction/internet",
      //   bgColor: "#24cbd1",
      //   fnColor: "white",
      // },
      // {
      //   icon: <GamepadIcon />,
      //   label: "Top Up Game",
      //   text: "Pesan tiket bus mudah dan cepat",
      //   path: "/transaction/game",
      //   topRecommend: true,
      //   bgColor: "#ff962e",
      //   fnColor: "white",
      // },
      // {
      //   icon: <ZapIcon />,
      //   label: "Pesan Token Listrik (PLN)",
      //   text: "Pesan tiket bus mudah dan cepat",
      //   path: "/transaction/pln",
      //   bgColor: "#892eff",
      //   fnColor: "white",
      // },
    ]
  },
  // {
  //   label: "",
  //   links: []
  // },
  // {
  //   label: "Menu Tiket Bus",
  //   links: [
  //     {
  //       icon: <BusIcon />,
  //       label: "Pemesanan Tiket",
  //       text: "Pesan tiket bus mudah dan cepat",
  //       path: "/bus/booking",
  //       topRecommend: true,
  //       bgColor: "#892eff",
  //       fnColor: "white",
  //     },
  //     {
  //       icon: <MapPinIcon />,
  //       label: "Master Kota",
  //       text: "Pengaturan data kota",
  //       path: "/bus/master-city",
  //       bgColor: "#45a8ff",
  //       fnColor: "white",
  //     },
  //     {
  //       icon: <PercentIcon />,
  //       label: "Voucher",
  //       text: "Manajemen voucher tiket bus",
  //       path: "/bus/voucher",
  //       bgColor: "#2e69ff",
  //       fnColor: "white",
  //     },
  //     {
  //       icon: <ChartAreaIcon />,
  //       label: "Laporan Tiket Bus",
  //       text: "Laporan transaksi tiket bus",
  //       path: "/bus/report",
  //       bgColor: "#24cbd1",
  //       fnColor: "white",
  //     },
  //     {
  //       icon: <ReceiptIcon />,
  //       label: "Struk",
  //       text: "Daftar struk tiket bus",
  //       path: "/bus/receipt",
  //       bgColor: "#ff962e",
  //       fnColor: "white",
  //     },
  //   ],
  // },
  // {
  //   label: "Menu Topup E-Wallet",
  //   links: [
  //     {
  //       icon: <WalletIcon />,
  //       label: "Topup",
  //       text: "Isi ulang saldo E-Wallet",
  //       path: "/e-wallet/topup",
  //       topRecommend: true,
  //       bgColor: "#419600",
  //       fnColor: "white",
  //     },
  //     {
  //       icon: <CreditCardIcon />,
  //       label: "Master E-Wallet",
  //       text: "Pengaturan data E-Wallet",
  //       path: "/e-wallet/master",
  //       topRecommend: true,
  //       bgColor: "#ee00ff",
  //       fnColor: "white",
  //     },
  //     {
  //       icon: <PercentIcon />,
  //       label: "Voucher",
  //       text: "Manajemen voucher E-Wallet",
  //       path: "/e-wallet/voucher",
  //       bgColor: "#2e69ff",
  //       fnColor: "white",
  //     },
  //     {
  //       icon: <ChartAreaIcon />,
  //       label: "Laporan Topup E-Wallet",
  //       text: "Laporan transaksi topup E-Wallet",
  //       path: "/e-wallet/report",
  //       bgColor: "#24cbd1",
  //       fnColor: "white",
  //     },
  //     {
  //       icon: <ReceiptIcon />,
  //       label: "Struk",
  //       text: "Daftar struk topup E-Wallet",
  //       path: "/e-wallet/receipt",
  //       bgColor: "#ff962e",
  //       fnColor: "white",
  //     },
  //   ],
  // }
]
export default globalPathOrigin