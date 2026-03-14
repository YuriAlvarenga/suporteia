import { useEffect } from "react"
import { supabase } from "../services/supabase"
import { useDispatch } from "react-redux"
import { setUser } from "../store/slices/auth/authSlice"

export default function AuthListener() {

  const dispatch = useDispatch()

  useEffect(() => {

    console.log("AuthListener iniciado")

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        console.log("EVENTO AUTH:", event)
        console.log("SESSION:", session)

        if (!session) {
          dispatch(setUser(null))
          return
        }

        const user = session.user

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, role, email")
          .eq("id", user.id)
          .single()

        console.log("PROFILE:", profile)
        console.log("PROFILE ERROR:", error)

        if (profile) {

          dispatch(
            setUser({
              id: user.id,
              email: user.email,
              fullName: profile.full_name,
              role: profile.role
            })
          )
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [dispatch])

  return null
}