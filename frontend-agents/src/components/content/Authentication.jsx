import { useContext, createContext, useState, useEffect } from "react"
import authOperation from "./_AuthOperation"
import RequestAPIApp from "../../lib/request"
import { useNavigate } from "react-router-dom"

const CreateAuthContext = createContext("auth")

function ParseJsonIfCanParser(jsonstr) {
  try {
    return JSON.parse(jsonstr)
  } catch {
    return String(jsonstr)
  }
}

export default function AuthenticationContext({ children }) {
  const navigate = useNavigate()
  const [authisLogin, setauthisLogin] = useState(false)
 
  function GetDeviceID() {
    const storageTy = localStorage.getItem("use-id")
    const cryptoKey = crypto.randomUUID()
    const generate = `${window?.navigator?.userAgentData?.platform||"Unknowing"} - ${cryptoKey}`
    if(storageTy) {
      return storageTy
    }
    localStorage.setItem("use-id", generate)
    return generate
  }
  function GetAuth() {
    const getUser = localStorage.getItem(authOperation.saveuserkey)||"{}"
    return {
      user: ParseJsonIfCanParser(getUser),
      token: localStorage.getItem(authOperation.savetokenkey)||null
    }
  }
  function SetAuth({ user, token } = {}) {
    localStorage.setItem(authOperation.saveuserkey, JSON.stringify(user))
    localStorage.setItem(authOperation.savetokenkey, String(token).trim())
  }
  async function RemoveAuth({ useRedirect = false } = {}) {
    const currentAuth = GetAuth()
    
    // If no token exists, just clear local storage
    if (!currentAuth.token) {
      localStorage.removeItem(authOperation.saveuserkey)
      localStorage.removeItem(authOperation.savetokenkey)
      if (useRedirect) {
        navigate("/") // Back To Home
      }
      return
    }

    try {
      await RequestAPIApp("/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${currentAuth.token}`,
          "accept": "application/json, text/txt"
        },
        showErrorOnToast: false,
      })
      
      // Success or any response, clear local storage
      localStorage.removeItem(authOperation.saveuserkey)
      localStorage.removeItem(authOperation.savetokenkey)
      
      if (useRedirect) {
        navigate("/") // Back To Home
      }
    } catch {
      // Even if logout fails, clear local storage to prevent stuck state
      localStorage.removeItem(authOperation.saveuserkey)
      localStorage.removeItem(authOperation.savetokenkey)
      
      if (useRedirect) {
        navigate("/") // Back To Home
      }
    }
  }

  useEffect(() => {
    const getauth = GetAuth()
    if(getauth.token && getauth.user) {
      // Validate token by calling /auth/me
      validateToken(getauth.token)
    }
  }, [])

  async function validateToken(token) {
    try {
      const response = await RequestAPIApp("/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "accept": "application/json, text/txt"
        },
        showErrorOnToast: false,
      })
      
      if (response.data?.data?.user) {
        // Token is valid, update user data and set login state
        SetAuth({ token, user: response.data.data.user })
        setauthisLogin(true)
      } else {
        // Token is invalid, clear auth
        RemoveAuth()
      }
    } catch {
      // Token validation failed, clear auth
      RemoveAuth()
    }
  }
  return <CreateAuthContext.Provider value={{
    GetAuth,
    SetAuth,
    RemoveAuth,
    GetDeviceID,
    validateToken,
    authisLogin
  }}>
    {children}
  </CreateAuthContext.Provider>
}

export function useAuthorization() {
  const authuse = useContext(CreateAuthContext)
  return {
    isLogin: authuse.authisLogin,
    GetDeviceID: () => {
      return authuse.GetDeviceID()
    },
    getToken: () => {
      return String(authuse.GetAuth()?.token||"")
    },
    getUser: () => {
      return authuse.GetAuth().user
    },
    headers: () => {
      const tokenUs = authuse.GetAuth()?.token
      const prefix = "Bearer"
      return {
        "Authorization": tokenUs ? `${prefix} ${tokenUs}` : "",
        "accept": "application/json, text/txt"
      }
    },
    setAuth: (token, user) => {
      return authuse.SetAuth({ token: token, user: user })
    },
    RemoveAuth: () => {
      return authuse.RemoveAuth()
    },
    refreshAuth: () => {
      const getauth = authuse.GetAuth()
      if (getauth.token) {
        return authuse.validateToken(getauth.token)
      }
    }
  }
}