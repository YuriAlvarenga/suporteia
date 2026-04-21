import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

import SignIn from "./components/auth/sign-in"
import Home from "./pages/home"
import BoardBriefing from "./components/dasboard/briefing/board-briefing"
import Tickets from "./components/tickets/ticket-from-database"
import SignUp from "./components/auth/sign-up"
import BoardOverviewer from "./components/dasboard/overviewer/board-overviewer"
import SetPassword from "./components/auth/set-password"

export default function AppRoutes() {

  function Private({ children }) {

    const { isAuthenticated, loadingSession, user } = useSelector((state) => state.auth)

    if (loadingSession) {
      return <div>Carregando sessão...</div>
    }

    if (!isAuthenticated) {
      return <Navigate to="/sign-in" replace />
    }

    // Verificamos se ele está tentando acessar algo que NÃO seja a página de senha (caso de usuários que precisam setar a primeira senha, vindos pelo convite)
    if (user && user.app_metadata?.provider === 'email' && !user.last_sign_in_at) {
      return <Navigate to="/set-password" replace />
    }

    return children
  }

  return (
    <Router>
      <Routes>

        {/* ROTAS PÚBLICAS (Acesso sem login) */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* ROTAS PRIVADAS (Acesso apenas logado) */}
        <Route path="/*" element={<Private><Home /></Private>} >
          <Route index element={<BoardOverviewer />} />
          <Route path="board-briefing" element={<BoardBriefing />} />
          <Route path="tickets/:companyId" element={<Tickets />} />
          <Route path="sign-up" element={<SignUp />} />
        </Route>

      </Routes>
    </Router>
  )
}