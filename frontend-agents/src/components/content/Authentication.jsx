import { useContext, createContext, useState, useEffect, useCallback, useMemo } from "react"
import authOperation from "./_AuthOperation"
import RequestAPIApp from "../../lib/request"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const CreateAuthContext = createContext(null)

function ParseJsonIfCanParser(jsonstr) {
  try {
    const parsed = JSON.parse(jsonstr)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export default function AuthenticationContext({ children }) {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState({
    user: ParseJsonIfCanParser(localStorage.getItem(authOperation.saveuserkey)),
    token: localStorage.getItem(authOperation.savetokenkey),
    isLoading: true,
    isLogin: false
  })
 
  const GetDeviceID = useCallback(() => {
    const storageTy = localStorage.getItem("use-id")
    if(storageTy) return storageTy
    
    const cryptoKey = crypto.randomUUID()
    const generate = `${window?.navigator?.userAgent || "Unknowing"} - ${cryptoKey}`
    localStorage.setItem("use-id", generate)
    return generate
  }, [])

  const SetAuth = useCallback((token, user) => {
    if (user) localStorage.setItem(authOperation.saveuserkey, JSON.stringify(user))
    if (token) localStorage.setItem(authOperation.savetokenkey, String(token).trim())
    
    setAuthState(prev => ({
      ...prev,
      user: user || prev.user,
      token: token || prev.token,
      isLogin: !!(token || prev.token) && !!(user || prev.user),
      isLoading: false
    }))
  }, [])

  const RemoveAuth = useCallback(async ({ useRedirect = false } = {}) => {
    const token = localStorage.getItem(authOperation.savetokenkey)
    
    if (token) {
      try {
        await RequestAPIApp("/auth/logout", {
          method: "POST",
          showErrorOnToast: false,
        })
      } catch (e) {
        console.error("Logout request failed", e)
      }
    }
    
    localStorage.removeItem(authOperation.saveuserkey)
    localStorage.removeItem(authOperation.savetokenkey)
    
    setAuthState({
      user: null,
      token: null,
      isLogin: false,
      isLoading: false
    })
    
    if (useRedirect) {
      navigate("/auth/login")
      toast.info("Anda telah keluar.")
    }
  }, [navigate])

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem(authOperation.savetokenkey)
    if (!token) {
      setAuthState(prev => ({ ...prev, isLoading: false, isLogin: false }))
      return false
    }

    const response = await RequestAPIApp("/auth/me", {
      method: "GET",
      showErrorOnToast: false,
    })
    
    if (!response.isError && response.data?.status === "success") {
      const user = response.data.data
      localStorage.setItem(authOperation.saveuserkey, JSON.stringify(user))
      setAuthState({
        user,
        token,
        isLogin: true,
        isLoading: false
      })
      return true
    } else {
      if (response.status === 401) {
        localStorage.removeItem(authOperation.saveuserkey)
        localStorage.removeItem(authOperation.savetokenkey)
        setAuthState({
          user: null,
          token: null,
          isLogin: false,
          isLoading: false
        })
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          isLogin: !!prev.token && !!prev.user,
          isLoading: false 
        }))
      }
      return false
    }
  }, [])

  useEffect(() => {
    validateToken()
  }, [validateToken])

  const contextValue = useMemo(() => ({
    ...authState,
    SetAuth,
    RemoveAuth,
    GetDeviceID,
    validateToken
  }), [authState, SetAuth, RemoveAuth, GetDeviceID, validateToken])

  return <CreateAuthContext.Provider value={contextValue}>
    {children}
  </CreateAuthContext.Provider>
}

export function useAuthorization() {
  const context = useContext(CreateAuthContext)
  if (!context) {
    throw new Error("useAuthorization must be used within an AuthenticationContext")
  }
  
  // Memoize the return value to prevent infinite loops in consumers
  return useMemo(() => ({
    isLogin: context.isLogin,
    isLoading: context.isLoading,
    GetDeviceID: context.GetDeviceID,
    getToken: () => context.token,
    getUser: () => context.user,
    headers: () => ({
      "Authorization": context.token ? `${authOperation.prefixToken} ${context.token}` : "",
      "Accept": "application/json"
    }),
    setAuth: (token, user) => context.SetAuth(token, user),
    RemoveAuth: (options) => context.RemoveAuth(options),
    refreshAuth: () => context.validateToken()
  }), [context])
}
