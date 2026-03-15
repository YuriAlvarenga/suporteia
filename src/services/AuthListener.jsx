import { useEffect, useRef } from "react"
import { supabase } from "../services/supabase"
import { useDispatch, useSelector } from "react-redux"
import { setUser } from "../redux/slice/auth/auth-login-slice"

export default function AuthListener() {
  const dispatch = useDispatch()
  
  // ✅ CORRETO: Hooks sempre aqui no topo
  const { isAuthenticated } = useSelector((state) => state.auth)
  const isProcessing = useRef(false)

  useEffect(() => {
    async function loadProfile(session) {
      if (isProcessing.current) return
      isProcessing.current = true

      try {
        console.log("👤 Carregando profile (F5 ou Sessão Recuperada):", session.user.id)
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
        console.error("Erro no AuthListener:", err)
        dispatch(setUser(null))
      } finally {
        isProcessing.current = false
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔥 EVENTO AUTH:", event)

      if (session) {
        // ✅ Se o botão de Login já preencheu o Redux, o isAuthenticated será true.
        // O Listener vai ver isso e NÃO vai rodar o loadProfile, evitando o conflito.
        if (!isAuthenticated) {
          loadProfile(session)
        }
      } else {
        // No logout, limpa o estado
        dispatch(setUser(null))
      }
    })

    return () => subscription.unsubscribe()
    
    // ✅ Adicionamos o isAuthenticated aqui para o useEffect "saber" quando ele mudar
  }, [dispatch, isAuthenticated]) 

  return null
}