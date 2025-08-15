import axios from "axios"
import authOperation from "../components/content/_AuthOperation"
import { toast } from "sonner"

// Apply Auto-Update Authentication
const applyUpdateUs = [
  "auth/me", "/auth/me"
]
const baseURL = "http://127.0.0.1:8000/api"
// const baseURL = "https://bd8001f04196.ngrok-free.app/api"
// const baseURL = "https://918b741c9ad5.ngrok-free.app/api"

async function RequestAPIApp(url, { useAuth = true, showErrorOnToast = true, ...options } = {}) {
  try {
    const basedAxios = axios.create({
      baseURL: baseURL
    })
    const getToken = localStorage.getItem(authOperation.savetokenkey)
    const axiosRequest = await basedAxios.request({
      ...options,
      headers: {
        ...(options.headers),
        Authorization: (!!useAuth && !!getToken && getToken?.length > 1 && typeof getToken === "string")?
        `${authOperation.prefixToken} ${getToken}`:undefined
      },
      url: url
    })
    if(applyUpdateUs.includes(url)) {
      // Always Update
      if(typeof axiosRequest.data?.data === "object") {
        localStorage.setItem(authOperation.saveuserkey, JSON.stringify(axiosRequest.data.data))
      }
    }
    return {
      ...axiosRequest,
      isJson: String(axiosRequest?.headers["content-type"]||"")?.match("application/json")
    }
  } catch(e) {
    const responses = e.response
    if(responses) {
      return {
        isError: true,
        ...responses,
        isJson: String(responses?.headers["content-type"]||"")?.match("application/json"),
        message: responses.data?.message||String(responses.data).slice(0, 189)
      }
    }
    if(showErrorOnToast) {
      toast.error("Upss, kesalahan di sisi client!",{
        description: "Kesalahan ini terjadi pada sisi client karena internet atau logika pada operasinya"
      })
    }
    return {
      isError: true,
      isClient: true,
      message: "Come fron client error, check your console on browser!"
    }
  }
}

export default RequestAPIApp

// function request() {
//   const authorizationToken = localStorage.getItem(authOperation.savetokenkey)
//   return {
//     get: async (pathURL, options = {}) => {
//       return RequestAPIApp(baseURL.replace(/{path}/g, pathURL), { ...options, authToken: authorizationToken, method: "GET" })
//     },
//     post: async (pathURL, options = {}) => {
//       return RequestAPIApp(baseURL.replace(/{path}/g, pathURL), { ...options, authToken: authorizationToken, method: "POST" })
//     },
//     patch: async (pathURL, options = {}) => {
//       return RequestAPIApp(baseURL.replace(/{path}/g, pathURL), { ...options, authToken: authorizationToken, method: "PATCH" })
//     },
//     put: async (pathURL, options = {}) => {
//       return RequestAPIApp(baseURL.replace(/{path}/g, pathURL), { ...options, authToken: authorizationToken, method: "PUT" })
//     },
//     delete: async (pathURL, options = {}) => {
//       return RequestAPIApp(baseURL.replace(/{path}/g, pathURL), { ...options, authToken: authorizationToken, method: "DELETE" })
//     },
//   }
// }

// module.exports = {
//   request: request
// }