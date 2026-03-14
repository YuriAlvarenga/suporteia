import { useEffect } from "react"
import { supabase } from "../services/supabase"
import { useDispatch } from "react-redux"
import { setUser } from "../redux/slice/auth/auth-login-slice"

export default function AuthListener() {

  const dispatch = useDispatch()

  useEffect(() => {

    console.log("AuthListener iniciado")

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(
        async (event, session) => {

          console.log("EVENTO AUTH:", event)

          if (!session) {
            dispatch(setUser(null))
            return
          }

          // Só buscar profile quando necessário
          if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {

            const user = session.user

            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, role, email")
              .eq("id", user.id)
              .single()

            dispatch(
              setUser({
                id: user.id,
                email: user.email,
                fullName: profile?.full_name,
                role: profile?.role
              })
            )
          }
        }
      )

    return () => {
      subscription.unsubscribe()
    }

  }, [dispatch])

  return null
}