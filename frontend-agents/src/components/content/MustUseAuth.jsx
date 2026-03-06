import { useEffect } from "react"
import { useAuthorization } from "./Authentication"
import { Outlet, useNavigate } from "react-router-dom"

/**
 * Must Use Auth To Visit!
 */
export default function MustUseAuth({ children, havelogin = null, havnonlogin = null }) {
  const author = useAuthorization()
  const navigate = useNavigate()

  useEffect(() => {
    // Wait until authentication initialization is finished
    if (author.isLoading) return

    if (!author.isLogin) {
      // User is not logged in
      if (havnonlogin && typeof havnonlogin.fn === "function") {
        havnonlogin.fn()
      }
      navigate("/auth/login")
    } else {
      // User is logged in
      if (havelogin) {
        if (typeof havelogin.fn === "function") {
          havelogin.fn()
        }
        if (havelogin.redirect && typeof havelogin.redirect === "string") {
          navigate(havelogin.redirect)
        }
      }
    }
  }, [author.isLogin, author.isLoading, navigate, havelogin, havnonlogin])

  if (author.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ba-shiroko-palette-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ba-shiroko-palette-medium" />
          <p className="text-[10px] font-black text-ba-shiroko-palette-medium uppercase tracking-[0.3em] animate-pulse">
            Initializing Supply Terminal...
          </p>
        </div>
      </div>
    )
  }

  // Only render children/outlet if we've determined the auth state
  // Or if we are explicitly handling "havelogin" (which usually means redirecting AWAY from login/register)
  if (!author.isLogin && !havelogin) {
    return null // Will redirect in useEffect
  }

  return <>
    {children ? children : <Outlet />}
  </>
}
