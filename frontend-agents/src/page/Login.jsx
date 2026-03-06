import Input from "../components/meta/Input"
import Button from "../components/meta/Button"
import { EyeIcon, EyeOff, MailIcon } from "lucide-react"
import { useState } from "react"
import Link from "../components/meta/Link"
import * as validate from "../lib/validate"
import HandleingValidateError from "../lib/handle-validate"
import RequestAPIApp from "../lib/request"
import { toast } from "sonner"
import { useAuthorization } from "../components/content/Authentication"
import HeadOperation from "../components/content/HeadOperation"
import { useNavigate } from "react-router-dom"

const createLoginValidate = new validate.Form("login")
createLoginValidate.append({
  email: validate.string("Email")
    .require().isEmail().min(2),
  password: validate.string("Kata Sandi")
    .require().min(8).max(255),
})

export default function Login() {
  const navigate = useNavigate()
  const author = useAuthorization()
  const [showPassword, setShowPassword] = useState(false)
  const [messageErr, setMessageErr] = useState({})
  const [loading, setLoading] = useState(false)

  async function SubmitForm(e) {
    e.preventDefault()
    if (loading) return
    
    const forms = new FormData(e.target)
    const dataForm = Object.fromEntries(forms)
    const useDevice = author.GetDeviceID()
    
    const structureForm = {
      email: dataForm.email,
      password: dataForm.password,
      device_name: useDevice
    }

    // Validate Form
    const isvalid = createLoginValidate.validate(structureForm)
    if(isvalid) {
      const parseErrorValid = HandleingValidateError(isvalid)
      setMessageErr(parseErrorValid.context)
      toast.error("Ada beberapa yang perlu diubah", {
        description: `Silahkan perbaiki input yang berwarna merah.`
      })
      return;
    }
    
    setMessageErr({})
    setLoading(true)

    // Request To API
    const response = await RequestAPIApp("/auth/login", {
      method: "POST",
      data: structureForm,
      showErrorOnToast: true,
    })

    setLoading(false)

    if (!response.isError && response.data?.status === "success") {
      const { token, user } = response.data.data
      author.setAuth(token, user)
      toast.success("Berhasil masuk!")
      navigate("/account")
    } else if (response.errors) {
      // Map Laravel validation errors to our messageErr state
      const mappedErrors = {}
      Object.keys(response.errors).forEach(key => {
        // Map backend field names to frontend field names if needed
        const fieldMap = {
          'email': 'email',
          'password': 'kata_sandi'
        }
        const frontendKey = fieldMap[key] || key
        mappedErrors[frontendKey] = response.errors[key][0]
      })
      setMessageErr(mappedErrors)
    }
  }

  return <>
    <HeadOperation
      title="AZStore - Masuk"
    />
    <div className="w-full h-full min-h-screen flex items-center justify-center px-3 py-[40px]">
      <form className="max-w-md w-full flex flex-col justify-center items-center px-2.5" onSubmit={SubmitForm}>
        <div className="w-full mb-3">
          <h2 className="font-bold text-2xl">Masuk</h2>
          <p className="mt-1.5 text-neutral-600">Silahkan masuk dahulu untuk dapat mengaksesnya.</p>
        </div>
        
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
          <p className={`mb-1 font-semibold ${messageErr?.kata_sandi ? 'text-red-500' : ''}`}>
            Kata Sandi {messageErr?.kata_sandi && `(${messageErr.kata_sandi})`}
          </p>
          <Input
            className="text-left"
            name="password"
            icon={showPassword?<EyeOff size={18}/>:<EyeIcon size={18}/>}
            type={showPassword?"text":"password"}
            placeholder="Password"
            error={!!messageErr?.kata_sandi}
          />
          <p className="my-2 text-[0.86rem] text-neutral-500 select-none">
            {showPassword ? (
              <span className="text-blue-500 cursor-pointer" onClick={() => setShowPassword(false)}>Sembunyikan kata sandi</span>
            ) : (
              <span className="text-blue-500 cursor-pointer" onClick={() => setShowPassword(true)}>Perlihatkan kata sandi</span>
            )}
          </p>
        </label>

        <div className="py-2.5 pt-3.5 w-full text-center">
          <p className="text-sm">Belum memiliki akun? <Link className="text-blue-500 font-semibold" href="/auth/register">Daftar disini</Link></p>
        </div>

        <Button className="mt-4 w-full" type="submit" disabled={loading}>
          <span className="px-2 font-semibold">{loading ? "Memproses..." : "Masuk"}</span>
        </Button>
      </form>
    </div>
  </>
}
