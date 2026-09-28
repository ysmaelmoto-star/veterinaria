import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Perfil = { id: string; nombre: string; rol: string; activo: boolean }

const ROLES = ['administrador', 'recepcionista', 'veterinario', 'inventario', 'grooming']

export default function Usuarios() {
  const [lista, setLista] = useState<Perfil[]>([])
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [rol, setRol] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    const { data } = await supabase
      .from('perfiles')
      .select('id, nombre, rol, activo')
      .order('creado_en', { ascending: false })
    setLista((data as Perfil[]) ?? [])
  }

  useEffect(() => {
    cargar()
  }, [])

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setMensaje('')
    if (clave.length < 8) return setMensaje('La contraseña debe tener al menos 8 caracteres')

    setGuardando(true)
    const { error } = await supabase.functions.invoke('crear-usuario', {
      body: { nombre: nombre.trim(), correo: correo.trim(), clave, rol },
    })
    setGuardando(false)

    if (error) {
      let texto = 'No se pudo crear el usuario'
      const respuesta = (error as { context?: Response }).context
      if (respuesta) {
        try {
          const j = await respuesta.json()
          texto = j.error ?? texto
        } catch {
          // se queda el mensaje general
        }
      }
      setMensaje(texto)
      return
    }

    setNombre('')
    setCorreo('')
    setClave('')
    setRol('')
    setMensaje('Usuario creado')
    cargar()
  }

  return (
    <div>
      <form onSubmit={guardar} style={{ display: 'grid', gap: 8, maxWidth: 360, margin: '0 auto 20px' }}>
        <input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <input type="password" placeholder="Contraseña (mínimo 8)" value={clave} onChange={(e) => setClave(e.target.value)} required />
        <select value={rol} onChange={(e) => setRol(e.target.value)} required>
          <option value="">Rol</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button type="submit" disabled={guardando}>{guardando ? 'Creando...' : 'Crear usuario'}</button>
        {mensaje && <p>{mensaje}</p>}
      </form>

      <table style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr><th>Nombre</th><th>Rol</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.rol}</td>
              <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}