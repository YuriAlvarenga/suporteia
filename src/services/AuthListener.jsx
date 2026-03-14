import { useEffect } from "react"
import { supabase } from "../services/supabase"
import { useDispatch } from "react-redux"
import { setUser } from "../redux/slice/auth/auth-login-slice"

export default function AuthListener() {

  const dispatch = useDispatch()

  useEffect(() => {

    console.log("AuthListener iniciado")

    supabase.auth.getSession().then(({ data }) => {
      console.log("Sessão atual:", data.session)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(
        async (event, session) => {

          console.log("EVENTO AUTH:", event)
          console.log("SESSION:", session)

          const authUser = session?.user

          if (!authUser) {
            dispatch(setUser(null))
            return
          }

          const { data: profile, error } = await supabase
            .from("profiles")
            .select("full_name, role, email")
            .eq("id", authUser.id)
            .single()

          console.log("PROFILE:", profile)
          console.log("PROFILE ERROR:", error)

          dispatch(
            setUser({
              id: authUser.id,
              email: authUser.email,
              fullName: profile?.full_name,
              role: profile?.role
            })
          )
        }
      )

    return () => subscription.unsubscribe()

  }, [dispatch])

  return null
}