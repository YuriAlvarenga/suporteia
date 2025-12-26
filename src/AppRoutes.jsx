import React, { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import SignIn from "./components/auth/sign-in"
import Home from "./pages/home"
import { useSelector } from "react-redux"
import BoardBriefing from "./components/dasboard/overviwer/board-briefing"
import Tickets from "./components/tickets/ticket-from-database"



export default function AppRoutes() {


    const Private = ({ children }) => {
        const { isAuthenticated, loading } = useSelector((state) => state.auth)

        if (loading) return <div>Carregando...</div>

        if (!isAuthenticated) {
            return <Navigate to={"/sign-in"} replace />
        }
        return children
    }


    return (
        <Router>
            <Routes>
                <Route exact path="/sign-in" element={<SignIn />}></Route>
                <Route exact path="/" element={<Private><Home /></Private>}>
                    <Route path="/board-briefing" element={<BoardBriefing/>} />
                    <Route path="/tickets" element={<Tickets/>} />
                </Route>
            </Routes>
        </Router>
    )
}