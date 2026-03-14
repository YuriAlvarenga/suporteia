import { useEffect } from "react"
import { supabase } from "../services/supabase"
import { useDispatch } from "react-redux"
import { setUser } from "../redux/slice/auth/auth-login-slice"

export default function AuthListener() {

  const dispatch = useDispatch()

  useEffect(() => {

    console.log("🚀 AuthListener iniciado")

    async function checkInitialSession() {

      console.log("🔎 Verificando sessão inicial...")

      const { data, error } = await supabase.auth.getSession()

      console.log("📦 getSession RESULT:", data)
      console.log("❌ getSession ERROR:", error)

      if (data?.session) {

        console.log("✅ Sessão inicial encontrada")

        await loadProfile(data.session)

      } else {

        console.log("⚠️ Nenhuma sessão inicial")
        dispatch(setUser(null))

      }
    }

    async function loadProfile(session) {

      console.log("👤 Carregando profile do usuário:", session.user.id)

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, role, email")
        .eq("id", session.user.id)
        .single()

      console.log("📦 PROFILE RESULT:", profile)
      console.log("❌ PROFILE ERROR:", error)

      if (error) {

        console.log("⚠️ Erro ao buscar profile")
        dispatch(setUser(null))
        return

      }

      console.log("✅ Enviando usuário para Redux")

      dispatch(
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: profile?.full_name,
          role: profile?.role
        })
      )

    }

    checkInitialSession()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(
        async (event, session) => {

          console.log("🔥 EVENTO AUTH:", event)
          console.log("📦 SESSION:", session)

          if (!session) {

            console.log("🚪 Usuário deslogado")
            dispatch(setUser(null))
            return

          }

          await loadProfile(session)

        }
      )

    return () => {

      console.log("🧹 Limpando AuthListener")
      subscription.unsubscribe()

    }

  }, [dispatch])

  return null
}