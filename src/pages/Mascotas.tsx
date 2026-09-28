import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  listarMascotas,
  listarClientesSimple,
  listarEspecies,
  listarRazas,
  crearMascota,
  subirFoto,
} from '../services/mascotas'
import type { Mascota } from '../services/mascotas'

type Opcion = { id: number; nombre: string }

export default function Mascotas() {
  const [lista, setLista] = useState<Mascota[]>([])
  const [clientes, setClientes] = useState<Opcion[]>([])
  const [especies, setEspecies] = useState<Opcion[]>([])
  const [razas, setRazas] = useState<Opcion[]>([])

  const [clienteId, setClienteId] = useState('')
  const [nombre, setNombre] = useState('')
  const [especieId, setEspecieId] = useState('')
  const [razaId, setRazaId] = useState('')
  const [sexo, setSexo] = useState('')
  const [nacimiento, setNacimiento] = useState('')
  const [peso, setPeso] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [claveFoto, setClaveFoto] = useState(0)
  const [mensaje, setMensaje] = useState('')

  async function cargarLista() {
    const { data } = await listarMascotas()
    setLista((data as unknown as Mascota[]) ?? [])
  }

  useEffect(() => {
    async function inicio() {
      const c = await listarClientesSimple()
      const e = await listarEspecies()
      setClientes((c.data as Opcion[]) ?? [])
      setEspecies((e.data as Opcion[]) ?? [])
      cargarLista()
    }
    inicio()
  }, [])

  useEffect(() => {
    async function cargarRazas() {
      setRazaId('')
      if (!especieId) {
        setRazas([])
        return
      }
      const { data } = await listarRazas(Number(especieId))
      setRazas((data as Opcion[]) ?? [])
    }
    cargarRazas()
  }, [especieId])

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setMensaje('')
    if (Number(peso) <= 0) return setMensaje('El peso debe ser mayor a 0')

    let fotoUrl: string | null = null
    if (foto) {
      if (!foto.type.startsWith('image/')) return setMensaje('El archivo debe ser una imagen')
      if (foto.size > 2 * 1024 * 1024) return setMensaje('La foto pesa más de 2 MB')
      const r = await subirFoto(foto)
      if (r.error) return setMensaje('No se pudo subir la foto: ' + r.error.message)
      fotoUrl = r.url
    }

    const { error } = await crearMascota({
      cliente_id: Number(clienteId),
      nombre: nombre.trim(),
      especie_id: Number(especieId),
      raza_id: Number(razaId),
      sexo,
      nacimiento,
      peso_kg: Number(peso),
      foto_url: fotoUrl,
    })
    if (error) {
      setMensaje('No se pudo guardar: ' + error.message)
      return
    }
    setNombre('')
    setClienteId('')
    setEspecieId('')
    setRazaId('')
    setSexo('')
    setNacimiento('')
    setPeso('')
    setFoto(null)
    setClaveFoto(claveFoto + 1)
    setMensaje('Mascota guardada')
    cargarLista()
  }

  return (
    <div>
      <form onSubmit={guardar} style={{ display: 'grid', gap: 8, maxWidth: 360, margin: '0 auto 20px' }}>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
          <option value="">Dueño (cliente)</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <input placeholder="Nombre de la mascota" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <select value={especieId} onChange={(e) => setEspecieId(e.target.value)} required>
          <option value="">Especie</option>
          {especies.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
        <select value={razaId} onChange={(e) => setRazaId(e.target.value)} required disabled={!especieId}>
          <option value="">Raza</option>
          {razas.map((r) => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>
        <select value={sexo} onChange={(e) => setSexo(e.target.value)} required>
          <option value="">Sexo</option>
          <option value="Hembra">Hembra</option>
          <option value="Macho">Macho</option>
        </select>
        <input type="date" value={nacimiento} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setNacimiento(e.target.value)} required />
        <input type="number" step="0.1" min="0.1" placeholder="Peso en kg" value={peso} onChange={(e) => setPeso(e.target.value)} required />
        <label>
          Foto (opcional, máximo 2 MB)
          <input
            key={claveFoto}
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
          />
        </label>
        <button type="submit">Guardar mascota</button>
        {mensaje && <p>{mensaje}</p>}
      </form>

      <table style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr><th>Foto</th><th>Mascota</th><th>Dueño</th><th>Especie</th><th>Raza</th><th>Sexo</th><th>Peso</th></tr>
        </thead>
        <tbody>
          {lista.map((m) => (
            <tr key={m.id}>
              <td>
                {m.foto_url && (
                  <img src={m.foto_url} alt={m.nombre} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                )}
              </td>
              <td>{m.nombre}</td>
              <td>{m.clientes?.nombre}</td>
              <td>{m.especies?.nombre}</td>
              <td>{m.razas?.nombre}</td>
              <td>{m.sexo}</td>
              <td>{m.peso_kg} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}