import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onEntrar }: { onEntrar: (rol: string) => void }) {
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave,
    })
    if (err || !data.user) {
      setError('Correo o clave incorrectos')
      return
    }
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', data.user.id)
      .single()
    if (!perfil) {
      setError('Tu usuario no tiene perfil')
      return
    }
    onEntrar(perfil.rol)
  }

  return (
    <form onSubmit={entrar} style={{ maxWidth: 320, margin: '80px auto', display: 'grid', gap: 12 }}>
      <h2>Clínica veterinaria</h2>
      <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
      <input type="password" placeholder="Clave" value={clave} onChange={(e) => setClave(e.target.value)} required />
      <button type="submit">Entrar</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}