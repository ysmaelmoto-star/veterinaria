import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Perfil = { id: string; nombre: string; rol: string; activo: boolean }

const ROLES = ['administrador', 'recepcionista', 'veterinario', 'inventario', 'grooming']

async function leerError(error: unknown, general: string) {
  const respuesta = (error as { context?: Response }).context
  if (respuesta) {
    try {
      const j = await respuesta.json()
      return (j.error as string) ?? general
    } catch {
      return general
    }
  }
  return general
}

export default function Usuarios() {
  const [lista, setLista] = useState<Perfil[]>([])
  const [yo, setYo] = useState('')
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [rol, setRol] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)

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

  function limpiar() {
    setNombre('')
    setCorreo('')
    setClave('')
    setRol('')
    setEditandoId(null)
  }

  function editar(u: Perfil) {
    setEditandoId(u.id)
    setNombre(u.nombre)
    setRol(u.rol)
    setMensaje('Editando usuario (el correo y la contraseña no se cambian aquí)')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  async function borrar(u: Perfil) {
    if (!confirm('¿Borrar la cuenta de ' + u.nombre + '? No se puede deshacer.')) return
    const { error } = await supabase.functions.invoke('borrar-usuario', { body: { id: u.id } })
    if (error) {
      setMensaje(await leerError(error, 'No se pudo borrar el usuario'))
      return
    }
    setMensaje('Usuario borrado')
    cargar()
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setMensaje('')

    if (editandoId) {
      const { data, error } = await supabase
        .from('perfiles')
        .update({ nombre: nombre.trim(), rol })
        .eq('id', editandoId)
        .select()
      if (error || !data || data.length === 0) {
        setMensaje('No se pudo actualizar el usuario')
        return
      }
      setMensaje('Usuario actualizado')
      limpiar()
      cargar()
      return
    }

    if (clave.length < 8) return setMensaje('La contraseña debe tener al menos 8 caracteres')

    setGuardando(true)
    const { error } = await supabase.functions.invoke('crear-usuario', {
      body: { nombre: nombre.trim(), correo: correo.trim(), clave, rol },
    })
    setGuardando(false)

    if (error) {
      setMensaje(await leerError(error, 'No se pudo crear el usuario'))
      return
    }

    limpiar()
    setMensaje('Usuario creado')
    cargar()
  }

  return (
    <div>
      <form onSubmit={guardar} style={{ display: 'grid', gap: 8, maxWidth: 360, margin: '0 auto 20px' }}>
        <input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        {!editandoId && (
          <>
            <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required autoComplete="off" />
            <input type="password" placeholder="Contraseña (mínimo 8)" value={clave} onChange={(e) => setClave(e.target.value)} required autoComplete="new-password" />
          </>
        )}
        <select value={rol} onChange={(e) => setRol(e.target.value)} required disabled={editandoId === yo}>
          <option value="">Rol</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button type="submit" disabled={guardando}>
          {editandoId ? 'Guardar cambios' : guardando ? 'Creando...' : 'Crear usuario'}
        </button>
        {editandoId && (
          <button type="button" onClick={() => { limpiar(); setMensaje('') }}>Cancelar</button>
        )}
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
              <td>{u.rol}</td>
              <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button onClick={() => editar(u)}>Editar</button>{' '}
                {u.id !== yo && (
                  <>
                    <button onClick={() => alternar(u)}>{u.activo ? 'Desactivar' : 'Activar'}</button>{' '}
                    <button onClick={() => borrar(u)}>Borrar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}