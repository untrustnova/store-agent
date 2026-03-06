import axios from "axios"
import authOperation from "../components/content/_AuthOperation"
import { toast } from "sonner"

const applyUpdateUs = [
  "auth/me", "/auth/me"
]

const baseURL = "http://127.0.0.1:8000/api"

async function RequestAPIApp(url, { useAuth = true, showErrorOnToast = true, ...options } = {}) {
  try {
    const basedAxios = axios.create({
      baseURL: baseURL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    const getToken = localStorage.getItem(authOperation.savetokenkey)
    
    const config = {
      ...options,
      url: url,
      headers: {
        ...options.headers,
      }
    }

    if (useAuth && getToken) {
      config.headers.Authorization = `${authOperation.prefixToken} ${getToken}`
    }

    const response = await basedAxios.request(config)

    // Handle auto-update for /auth/me
    if (applyUpdateUs.includes(url) || applyUpdateUs.includes(`/${url}`)) {
      if (response.data?.status === "success" && response.data?.data) {
        localStorage.setItem(authOperation.saveuserkey, JSON.stringify(response.data.data))
      }
    }

    return {
      status: response.status,
      data: response.data,
      isError: false,
      isJson: true
    }
  } catch (e) {
    const response = e.response
    
    if (response) {
      const errorMessage = response.data?.message || "Terjadi kesalahan pada server"
      
      // Global 401 Unauthorized handling
      if (response.status === 401) {
        localStorage.removeItem(authOperation.saveuserkey)
        localStorage.removeItem(authOperation.savetokenkey)
        
        // Redirect if not already on login/register page
        const currentPath = window.location.pathname
        if (!currentPath.includes('/auth/login') && !currentPath.includes('/auth/register')) {
          window.location.href = '/auth/login?expired=true'
        }
        
        if (showErrorOnToast) {
          toast.error("Sesi Berakhir", {
            description: "Sesi anda telah berakhir, silahkan masuk kembali."
          })
        }
      } else if (showErrorOnToast) {
        toast.error("Kesalahan Server", {
          description: errorMessage
        })
      }

      return {
        status: response.status,
        data: response.data,
        isError: true,
        message: errorMessage,
        errors: response.data?.errors
      }
    }

    if (showErrorOnToast) {
      toast.error("Kesalahan Koneksi", {
        description: "Gagal terhubung ke server. Pastikan koneksi internet anda stabil."
      })
    }

    return {
      isError: true,
      isClient: true,
      message: "Gagal terhubung ke server"
    }
  }
}

export default RequestAPIApp
