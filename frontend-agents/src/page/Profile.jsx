import { useAuthorization } from "../components/content/Authentication"
import HeadOperation from "../components/content/HeadOperation"
import RequestAPIApp from "../lib/request"
import CanvasGenerateImagePicture from "../lib/canvas-generate-img"
import { useEffect, useState } from "react"

export default function ProfileUser() {
  const author = useAuthorization()
  const [getProfile, setProfile] = useState({
    data: {}, loading: true
  })
  const getIsVerification = getProfile.loading? "Memuat...":getProfile.data?.is_active?"Terverfikasi":"Tdk Terverifikasi"
  const getVerifColor = getProfile.loading? "gray":getProfile.data?.is_active?"green":"red"

  async function GetProfileUser() {
    const pictureImg = CanvasGenerateImagePicture(400, 400)
    try {
      const request = await RequestAPIApp("/auth/me", { 
        headers: author.headers(),
        showErrorOnToast: false 
      })
    let profileUser = {}
      if(request.data?.data?.user) {
        profileUser = request.data.data.user
    } else {
      const getLocalUser = author.getUser()
      profileUser = getLocalUser
    }
    setProfile({
      data: {
        profile: profileUser.profile||pictureImg,
        username: profileUser.name,
          phone: profileUser.phone_number,
        address: profileUser.address,
        balance: profileUser.balance,
        is_active: profileUser.is_active,
        },
        loading: false
      })
    } catch {
      // Fallback to local data if API fails
      const getLocalUser = author.getUser()
      setProfile({
        data: {
          profile: pictureImg,
          username: getLocalUser.name || 'Unknown',
          phone: getLocalUser.phone_number || 'Unknown',
          address: getLocalUser.address || 'Unknown',
          balance: getLocalUser.balance || '0.00',
          is_active: getLocalUser.is_active || false,
      },
      loading: false
    })
    }
  }

  useEffect(() => {
    GetProfileUser()
  }, [])

  return <>
    <HeadOperation
      title="AZStore - Profile Akun"
    />
    <div className="w-full p-3.5">
      <h2 className="text-2xl font-bold mb-4.5">Profile</h2>
      <div className="w-full border border-gray-200 rounded-md mt-1.5 mb-0.5 p-2.5 flex items-center shadow-xs">
        <div className="w-[70px] h-[70px] rounded-full overflow-hidden flex justify-center items-center">
          {getProfile.data?.profile&&<img src={getProfile.data.profile} className="w-full h-full object-cover" loading="lazy"/>}
        </div>
        <div className="w-[calc(100%-70px)] px-2.5 overflow-ellipsis overflow-hidden">
          <b className="text-xl text-nowrap overflow-ellipsis overflow-hidden">{getProfile.data?.username? getProfile.data?.username:"Memuat..."}</b>
          <p className="text-nowrap overflow-ellipsis overflow-hidden">{getProfile.data?.phone? getProfile.data?.phone:"Memuat..."}</p>
          <p className="text-nowrap overflow-ellipsis overflow-hidden text-sm text-gray-600">{getProfile.data?.address? getProfile.data?.address:"Memuat..."}</p>
        </div>
      </div>
      <div className="w-full flex justify-between">
        <div className="w-[calc(calc(100%/2)_-_5px)] border border-gray-200 rounded-md my-2.5 p-2.5 px-3.5 shadow-xs">
          <h3 className="text-md font-semibold">Saldo</h3>
          <p className="text-sm mt-1 text-neutral-600 text-nowrap overflow-ellipsis overflow-hidden">
            {getProfile.data?.balance ? `Rp ${Number(getProfile.data.balance).toLocaleString()}` : "Memuat..."}
          </p>
        </div>
        <div className="w-[calc(calc(100%/2)_-_5px)] border border-gray-200 rounded-md my-2.5 p-2.5 px-3.5 shadow-xs">
          <h3 className="text-md font-semibold">Terverifikasi?</h3>
          <p className="text-sm mt-1 text-neutral-600 text-nowrap overflow-ellipsis overflow-hidden" style={{ color: getVerifColor }}>{getIsVerification}</p>
        </div>
      </div>
      {/* <pre style={{ fontSize: "0.5rem" }}>{JSON.stringify(getProfile,null,2)}</pre> */}
    </div>
  </>
}