import { useEffect } from "react"
import { supabase } from "./supabase"
import { useDispatch } from "react-redux"
import { setUser } from "../redux/slice/auth/auth-login-slice"

export default function AuthListener() {
  const dispatch = useDispatch()

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null))
    })

    return () => listener.subscription.unsubscribe()
  }, [dispatch])

  return null
}