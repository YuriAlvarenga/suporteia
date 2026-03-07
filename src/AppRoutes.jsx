import React, { useEffect, useRef } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import SignIn from "./components/auth/sign-in"
import Home from "./pages/home"
import { useSelector, useDispatch } from "react-redux"
import BoardBriefing from "./components/dasboard/briefing/board-briefing"
import Tickets from "./components/tickets/ticket-from-database"
import { loadUserFromSession } from "./redux/slice/auth/auth-login-slice"
import SignUp from "./components/auth/sign-up"

export default function AppRoutes() {

    const dispatch = useDispatch()
    const sessionLoaded = useRef(false)

    const { isAuthenticated, loadingSession } = useSelector((state) => state.auth)

    useEffect(() => {

        if (sessionLoaded.current) return

        sessionLoaded.current = true

        dispatch(loadUserFromSession())

    }, [dispatch])

    const Private = ({ children }) => {

        if (loadingSession) return <div>Carregando...</div>

        if (!isAuthenticated) {
            return <Navigate to={"/sign-in"} replace />
        }

        return children
    }

    return (
        <Router>
            <Routes>

                <Route path="/sign-in" element={<SignIn />} />

                <Route path="/*" element={<Private><Home /></Private>}>

                    <Route path="board-briefing" element={<BoardBriefing />} />

                    <Route path="tickets/:companyId" element={<Tickets />} />

                    <Route path="sign-up" element={<SignUp />} />

                </Route>

            </Routes>
        </Router>
    )
}