import { useEffect } from "react"
import { supabase } from "../services/supabase"
import { useDispatch } from "react-redux"
import { setUser } from "../redux/slice/auth/auth-login-slice"

export default function AuthListener() {

  const dispatch = useDispatch()

  useEffect(() => {

    console.log("🚀 AuthListener iniciado")

    async function loadProfile(session) {

      console.log("👤 Carregando profile:", session.user.id)

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, role, email")
        .eq("id", session.user.id)
        .single()

      if (error) {
        dispatch(setUser(null))
        return
      }

      dispatch(
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: profile?.full_name,
          role: profile?.role
        })
      )
    }

    // Dentro do useEffect do AuthListener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔥 EVENTO AUTH:", event);

      if (session) {
        // SÓ carregar se o evento for de login ou se o token mudou
        // Isso evita disparar loadProfile em re-renders desnecessários
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          await loadProfile(session);
        }
      } else {
        // Se não tem sessão (ou SIGNED_OUT), limpa o estado e desliga o loading
        dispatch(setUser(null));
      }
    });

    return () => {
      console.log("🧹 Limpando AuthListener")
      subscription.unsubscribe()
    }

  }, [dispatch])

  return null
}