import './App.css'
import AppRoutes from './AppRoutes'
import AuthListener from './services/AuthListener'

export default function App() {
  return (
     <>
      <AuthListener />
      <AppRoutes />
    </>
  )
}
