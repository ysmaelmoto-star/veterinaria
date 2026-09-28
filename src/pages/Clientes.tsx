import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { listarClientes, crearCliente, actualizarCliente, borrarCliente } from '../services/clientes'
import type { Cliente } from '../services/clientes'

export default function Clientes() {
  const [lista, setLista] = useState<Cliente[]>([])
  const [buscar, setBuscar] = useState('')
  const [nombre, setNombre] = useState('')
  const [dni, setDni] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)

  async function cargar() {
    const { data } = await listarClientes(buscar)
    setLista((data as Cliente[]) ?? [])
  }

  useEffect(() => {
    cargar()
  }, [buscar])

  function limpiar() {
    setNombre('')
    setDni('')
    setTelefono('')
    setCorreo('')
    setEditandoId(null)
  }

  function editar(c: Cliente) {
    setEditandoId(c.id)
    setNombre(c.nombre)
    setDni(c.dni)
    setTelefono(c.telefono)
    setCorreo(c.correo ?? '')
    setMensaje('Editando cliente')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function borrar(c: Cliente) {
    if (!confirm('¿Borrar a ' + c.nombre + '? También se borrarán sus mascotas.')) return
    const { data, error } = await borrarCliente(c.id)
    if (error) {
      setMensaje('No se pudo borrar: ' + error.message)
      return
    }
    if (!data || data.length === 0) {
      setMensaje('No tienes permiso para borrar (solo el administrador)')
      return
    }
    setMensaje('Cliente borrado')
    cargar()
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setMensaje('')
    if (!/^\d{8}$/.test(dni)) return setMensaje('El DNI debe tener 8 números')
    if (!/^9\d{8}$/.test(telefono)) return setMensaje('El teléfono debe tener 9 números y empezar con 9')
    if (!/^\S+@\S+\.\S+$/.test(correo)) return setMensaje('El correo no es válido')

    const datos = { nombre: nombre.trim(), dni, telefono, correo }
    let error: { code?: string; message: string } | null
    if (editandoId) {
      const r = await actualizarCliente(editandoId, datos)
      error = r.error
      if (!error && (!r.data || r.data.length === 0)) {
        return setMensaje('No tienes permiso para editar')
      }
    } else {
      error = (await crearCliente(datos)).error
    }

    if (error) {
      setMensaje(error.code === '23505' ? 'Ese DNI ya está registrado' : 'No se pudo guardar: ' + error.message)
      return
    }
    setMensaje(editandoId ? 'Cliente actualizado' : 'Cliente guardado')
    limpiar()
    cargar()
  }

  return (
    <div>
      <form onSubmit={guardar} style={{ display: 'grid', gap: 8, maxWidth: 360, margin: '0 auto 20px' }}>
        <input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <input placeholder="DNI (8 números)" value={dni} onChange={(e) => setDni(e.target.value)} required />
        <input placeholder="Teléfono (9 números)" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        <input placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Guardar cliente'}</button>
        {editandoId && (
          <button type="button" onClick={() => { limpiar(); setMensaje('') }}>Cancelar</button>
        )}
        {mensaje && <p>{mensaje}</p>}
      </form>

      <input
        placeholder="Buscar por nombre o DNI"
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        style={{ width: '100%', marginBottom: 12 }}
      />

      <table style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Correo</th><th></th></tr>
        </thead>
        <tbody>
          {lista.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td><td>{c.dni}</td><td>{c.telefono}</td><td>{c.correo}</td>
              <td>
                <button onClick={() => editar(c)}>Editar</button>{' '}
                <button onClick={() => borrar(c)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}