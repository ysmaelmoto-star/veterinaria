import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Clientes from './pages/Clientes'
import Mascotas from './pages/Mascotas'
import Usuarios from './pages/Usuarios'

const MENU: Record<string, string[]> = {
  administrador: ['Clientes', 'Mascotas', 'Usuarios'],
  recepcionista: ['Clientes', 'Mascotas'],
  veterinario: ['Clientes', 'Mascotas'],
  inventario: [],
  grooming: [],
}

export default function App() {
  const [rol, setRol] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [pagina, setPagina] = useState('')

  useEffect(() => {
    async function revisar() {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', data.session.user.id)
          .single()
        if (perfil) setRol(perfil.rol)
      }
      setCargando(false)
    }
    revisar()
  }, [])

  async function salir() {
    await supabase.auth.signOut()
    setRol(null)
    setPagina('')
  }

  if (cargando) return <p>Cargando...</p>
  if (!rol) return <Login onEntrar={setRol} />

  const opciones = MENU[rol] ?? []

  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #ccc' }}>
        <strong>Clínica veterinaria ({rol})</strong>
        {opciones.map((o) => (
          <button key={o} onClick={() => setPagina(o)}>{o}</button>
        ))}
        <button onClick={salir} style={{ marginLeft: 'auto' }}>Salir</button>
      </nav>
      <main style={{ padding: 20 }}>
        {pagina === 'Clientes' ? (
          <Clientes />
        ) : pagina === 'Mascotas' ? (
          <Mascotas />
        ) : pagina === 'Usuarios' ? (
          <Usuarios />
        ) : (
          <h2>{pagina || 'Inicio'}</h2>
        )}
      </main>
    </div>
  )
}