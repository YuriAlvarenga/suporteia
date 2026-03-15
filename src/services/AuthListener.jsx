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

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (event, session) => {

        console.log("🔥 EVENTO AUTH:", event)

        if (event === "SIGNED_OUT") {

          dispatch(setUser(null))
          return

        }

        if (session) {

          await loadProfile(session)

        }

      })

    return () => {
      console.log("🧹 Limpando AuthListener")
      subscription.unsubscribe()
    }

  }, [dispatch])

  return null
}