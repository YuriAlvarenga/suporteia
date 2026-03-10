import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

import SignIn from "./components/auth/sign-in"
import Home from "./pages/home"
import BoardBriefing from "./components/dasboard/briefing/board-briefing"
import Tickets from "./components/tickets/ticket-from-database"
import SignUp from "./components/auth/sign-up"

export default function AppRoutes() {

  const { isAuthenticated } = useSelector((state) => state.auth)

  const Private = ({ children }) => {

    if (!isAuthenticated) {
      return <Navigate to="/sign-in" replace />
    }

    return children
  }

  return (
    <Router>
      <Routes>

        <Route path="/sign-in" element={<SignIn />} />

        <Route path="/*" element={ <Private><Home /></Private>} >

          <Route path="board-briefing" element={<BoardBriefing />} />

          <Route path="tickets/:companyId" element={<Tickets />} />

          <Route path="sign-up" element={<SignUp />} />

        </Route>

      </Routes>
    </Router>
  )
}