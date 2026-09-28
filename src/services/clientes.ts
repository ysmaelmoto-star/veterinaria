import { supabase } from '../lib/supabase'

export type Cliente = {
  id: number
  nombre: string
  dni: string
  telefono: string
  correo: string | null
}

export async function listarClientes(texto: string) {
  let consulta = supabase
    .from('clientes')
    .select('*')
    .order('creado_en', { ascending: false })
  const t = texto.trim().replace(/[,()%]/g, '')
  if (t) consulta = consulta.or(`nombre.ilike.%${t}%,dni.ilike.%${t}%`)
  return consulta
}

export async function crearCliente(c: Omit<Cliente, 'id'>) {
  return supabase.from('clientes').insert(c)
}

export async function actualizarCliente(id: number, c: Omit<Cliente, 'id'>) {
  return supabase.from('clientes').update(c).eq('id', id).select()
}

export async function borrarCliente(id: number) {
  return supabase.from('clientes').delete().eq('id', id).select()
}