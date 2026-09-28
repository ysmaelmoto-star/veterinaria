import { useState } from 'react'
import Login from './pages/Login'

export default function App() {
  const [rol, setRol] = useState<string | null>(null)

  if (!rol) return <Login onEntrar={setRol} />
  return <h1>Bienvenido, tu rol es: {rol}</h1>
}