import { useEffect, useRef } from "react"
import { supabase } from "../services/supabase"
import { useDispatch } from "react-redux"
import { setUser } from "../redux/slice/auth/auth-login-slice"

export default function AuthListener() {
  const dispatch = useDispatch()
  const isProcessing = useRef(false) // Trava para evitar processamento duplo simultâneo

  useEffect(() => {
    async function loadProfile(session) {
      if (isProcessing.current) return;
      isProcessing.current = true;

      try {
        console.log("👤 Carregando profile:", session.user.id)
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, role, email")
          .eq("id", session.user.id)
          .single()

        if (error) throw error;

        dispatch(setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: profile?.full_name,
          role: profile?.role
        }))
      } catch (err) {
        console.error("Erro no AuthListener:", err)
        dispatch(setUser(null)) // Isso garante que o loadingSession vire false mesmo em erro
      } finally {
        isProcessing.current = false;
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔥 EVENTO AUTH:", event)
      
      if (session) {
        loadProfile(session)
      } else {
        dispatch(setUser(null))
      }
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  return null
}