import { useEffect, useRef } from "react"
import { supabase } from "../services/supabase"
import { useDispatch, useSelector } from "react-redux"
import { setUser } from "../redux/slice/auth/auth-login-slice"

export default function AuthListener() {
  const dispatch = useDispatch()
  
  const { isAuthenticated } = useSelector((state) => state.auth)
  const isProcessing = useRef(false)

  useEffect(() => {
    async function loadProfile(session) {
      if (isProcessing.current) return
      isProcessing.current = true

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, role, email")
          .eq("id", session.user.id)
          .single()

        if (error) throw error

        dispatch(setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: profile?.full_name,
          role: profile?.role
        }))
      } catch (err) {
        dispatch(setUser(null))
      } finally {
        isProcessing.current = false
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {

      if (session) {
        if (!isAuthenticated) {
          loadProfile(session)
        }
      } else {
        // No logout, limpa o estado
        dispatch(setUser(null))
      }
    })

    return () => subscription.unsubscribe()
    
  }, [dispatch, isAuthenticated]) 

  return null
}