import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import GetLocationWithMap from "../components/content/GetLocationWithMap"
import { EyeIcon, EyeOff, MailIcon, Map, PhoneIcon, User2 } from "lucide-react"
import { useRef, useState } from "react"
import Link from "../components/meta/Link"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"
import RequestAPIApp from "../lib/request"
import { toast } from "sonner"
import HeadOperation from "../components/content/HeadOperation"
import { useNavigate } from "react-router-dom"

const createRegisterValidate = new validate.Form("register")
createRegisterValidate.append({
  name: validate.string("Nama")
    .require().min(4).max(255),
  email: validate.string("Email")
    .require().isEmail().min(2),
  phone_number: validate.string("Nomer Telpon")
    .require().min(10).max(15),
  address: validate.string("Alamat")
    .require().min(2),
  password: validate.string("Kata Sandi")
    .require().min(8).max(255),
  password_confirmation: validate.string("Konfirmasi Kata Sandi")
    .require().min(8).max(255)
})

export default function Register() {
  const navigate = useNavigate()
  const [inputuseMap, setinputuseMap] = useState(false)
  const [showToMap, setShowToMap] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [messageErr, setMessageErr] = useState({})
  const [loading, setLoading] = useState(false)
  const addressRef = useRef()

  const inputUseMap = () => {
    setinputuseMap(!inputuseMap)
    if(!inputuseMap === true) {
      setTimeout(() => {
        setShowToMap(!inputuseMap)
      }, 300)
    } else {
      setShowToMap(!inputuseMap)
    }
  }

  async function SubmitForm(e) {
    e.preventDefault()
    if (loading) return

    const forms = new FormData(e.target)
    const dataForm = Object.fromEntries(forms)
    
    const structureForm = {
      name: dataForm.name,
      email: dataForm.email,
      phone_number: dataForm.phone_number,
      address: dataForm.address,
      password: dataForm.password,
      password_confirmation: dataForm.password_confirmation,
    }

    // Validate Form
    const isvalid = createRegisterValidate.validate(structureForm)
    if(isvalid) {
      const parseErrorValid = HandleingValidateError(isvalid)
      setMessageErr(parseErrorValid.context)
      toast.error("Ada beberapa yang perlu diubah", {
        description: `Silahkan perbaiki input yang berwarna merah.`
      })
      return;
    }

    // Validate Password Confirmation
    if(structureForm.password !== structureForm.password_confirmation) {
      toast.error("Konfirmasi kata sandi tidak cocok")
      setMessageErr({
        konfirmasi_kata_sandi: "Konfirmasi kata sandi tidak cocok"
      })
      return;
    }

    setMessageErr({})
    setLoading(true)

    // Request To API
    const response = await RequestAPIApp("/auth/register", {
      method: "POST",
      data: structureForm,
      showErrorOnToast: true,
    })

    setLoading(false)

    if (!response.isError && response.data?.status === "success") {
      toast.success("Berhasil terdaftar! Silahkan masuk.")
      navigate("/auth/login")
    } else if (response.errors) {
      const mappedErrors = {}
      Object.keys(response.errors).forEach(key => {
        const fieldMap = {
          'name': 'nama',
          'email': 'email',
          'phone_number': 'nomer_telpon',
          'address': 'alamat',
          'password': 'kata_sandi',
          'password_confirmation': 'konfirmasi_kata_sandi'
        }
        const frontendKey = fieldMap[key] || key
        mappedErrors[frontendKey] = response.errors[key][0]
      })
      setMessageErr(mappedErrors)
    }
  }

  return <>
    <HeadOperation
      title="AZStore - Daftar Akun"
    />
    <div className="w-full h-full min-h-screen flex items-center justify-center px-3 py-[40px]">
      <form className="max-w-md w-full flex flex-col justify-center items-center px-2.5" onSubmit={SubmitForm}>
        <div className="w-full mb-3">
          <h2 className="font-bold text-2xl">Daftar Akun</h2>
          <p className="mt-1.5 text-neutral-600">Silahkan daftar terlebih dahulu untuk dapat mengaksesnya.</p>
        </div>

        <label className="w-full my-1">
          <p className={`mb-1 font-semibold ${messageErr?.nama ? 'text-red-500' : ''}`}>
            Nama {messageErr?.nama && `(${messageErr.nama})`}
          </p>
          <Input
            className="text-left"
            type="text"
            name="name"
            icon={<User2 size={18}/>}
            placeholder="Nama Lengkap"
            error={!!messageErr?.nama}
          />
        </label>

        <label className="w-full my-1">
          <p className={`mb-1 font-semibold ${messageErr?.email ? 'text-red-500' : ''}`}>
            Email {messageErr?.email && `(${messageErr.email})`}
          </p>
          <Input
            className="text-left"
            type="email"
            name="email"
            icon={<MailIcon size={18}/>}
            placeholder="Email (shiroko@gmail.com)"
            error={!!messageErr?.email}
          />
        </label>

        <label className="w-full my-1">
          <p className={`mb-1 font-semibold ${messageErr?.nomer_telpon ? 'text-red-500' : ''}`}>
            Nomor Telepon {messageErr?.nomer_telpon && `(${messageErr.nomer_telpon})`}
          </p>
          <Input
            className="text-left"
            type="tel"
            name="phone_number"
            icon={<PhoneIcon size={18}/>}
            placeholder="Contoh: 08123456789"
            error={!!messageErr?.nomer_telpon}
          />
        </label>

        <label className="w-full my-1">
          <p className={`mb-1 font-semibold ${messageErr?.alamat ? 'text-red-500' : ''}`}>
            Alamat {messageErr?.alamat && `(${messageErr.alamat})`}
          </p>
          <Input
            className="text-left"
            name="address"
            disabled={inputuseMap}
            type="text"
            ref={addressRef}
            icon={<Map size={18}/>}
            placeholder="Alamat Lengkap"
            error={!!messageErr?.alamat}
          />
          <p className="my-2 text-[0.86rem] text-neutral-500">
            {inputuseMap ? (
              <>Tidak ingin menggunakan peta? <span className="text-blue-500 cursor-pointer" onClick={inputUseMap}>Input manual</span></>
            ) : (
              <>Ingin mencari alamat? <span className="text-blue-500 cursor-pointer" onClick={inputUseMap}>Gunakan peta</span></>
            )}
          </p>
          
          <div className="w-full overflow-hidden rounded-md duration-150" style={{ height: inputuseMap?"340px":"0px" }}>
            {showToMap&&<GetLocationWithMap
              onChange={(e) => {
                addressRef.current.value = e?.location||""
              }}
            />}
          </div>
        </label>

        <label className="w-full my-1">
          <p className={`mb-1 font-semibold ${messageErr?.kata_sandi ? 'text-red-500' : ''}`}>
            Kata Sandi {messageErr?.kata_sandi && `(${messageErr.kata_sandi})`}
          </p>
          <Input
            className="text-left"
            icon={showPassword?<EyeOff size={18}/>:<EyeIcon size={18}/>}
            name="password"
            type={showPassword?"text":"password"}
            placeholder="Minimal 8 karakter"
            error={!!messageErr?.kata_sandi}
          />
          
          <p className={`mt-3 mb-1 font-semibold ${messageErr?.konfirmasi_kata_sandi ? 'text-red-500' : ''}`}>
            Konfirmasi Kata Sandi {messageErr?.konfirmasi_kata_sandi && `(${messageErr.konfirmasi_kata_sandi})`}
          </p>
          <Input
            icon={showPassword?<EyeOff size={18}/>:<EyeIcon size={18}/>}
            className="text-left"
            name="password_confirmation"
            type={showPassword?"text":"password"}
            placeholder="Ulangi kata sandi"
            error={!!messageErr?.konfirmasi_kata_sandi}
          />
          
          <p className="my-2 text-[0.86rem] text-neutral-500 select-none cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          </p>
        </label>

        <div className="py-2.5 pt-3.5 w-full text-center">
          <p className="text-sm">Sudah punya akun? <Link className="text-blue-500 font-semibold" href="/auth/login">Masuk disini</Link></p>
        </div>

        <Button className="mt-4 w-full" type="submit" disabled={loading}>
          <span className="px-2 font-semibold">{loading ? "Mendaftarkan..." : "Daftar Sekarang"}</span>
        </Button>
      </form>
    </div>
  </>
}
