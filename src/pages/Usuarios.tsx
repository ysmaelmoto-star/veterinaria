import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Perfil = { id: string; nombre: string; rol: string; activo: boolean }

const ROLES = ['administrador', 'recepcionista', 'veterinario', 'inventario', 'grooming']

export default function Usuarios() {
  const [lista, setLista] = useState<Perfil[]>([])
  const [yo, setYo] = useState('')
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
    supabase.auth.getUser().then(({ data }) => setYo(data.user?.id ?? ''))
    cargar()
  }, [])

  async function cambiarRol(u: Perfil, nuevoRol: string) {
    if (!confirm('¿Cambiar el rol de ' + u.nombre + ' a ' + nuevoRol + '?')) return
    const { data, error } = await supabase
      .from('perfiles')
      .update({ rol: nuevoRol })
      .eq('id', u.id)
      .select()
    if (error || !data || data.length === 0) {
      setMensaje('No se pudo cambiar el rol')
      return
    }
    setMensaje('Rol actualizado')
    cargar()
  }

  async function alternar(u: Perfil) {
    const accion = u.activo ? 'desactivar' : 'activar'
    if (!confirm('¿Quieres ' + accion + ' a ' + u.nombre + '?')) return
    const { data, error } = await supabase
      .from('perfiles')
      .update({ activo: !u.activo })
      .eq('id', u.id)
      .select()
    if (error || !data || data.length === 0) {
      setMensaje('No se pudo cambiar el estado')
      return
    }
    setMensaje(u.activo ? 'Usuario desactivado' : 'Usuario activado')
    cargar()
  }

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
        <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required autoComplete="off" />
        <input type="password" placeholder="Contraseña (mínimo 8)" value={clave} onChange={(e) => setClave(e.target.value)} required autoComplete="new-password" />
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
          <tr><th>Nombre</th><th>Rol</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>
                <select
                  value={u.rol}
                  disabled={u.id === yo}
                  onChange={(e) => cambiarRol(u, e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
              <td>
                {u.id !== yo && (
                  <button onClick={() => alternar(u)}>{u.activo ? 'Desactivar' : 'Activar'}</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}