import { supabase } from '../lib/supabase'

export type Mascota = {
  id: number
  nombre: string
  sexo: string
  nacimiento: string
  peso_kg: number
  clientes: { nombre: string } | null
  especies: { nombre: string } | null
  razas: { nombre: string } | null
}

export async function listarMascotas() {
  return supabase
    .from('mascotas')
    .select('id, nombre, sexo, nacimiento, peso_kg, clientes(nombre), especies(nombre), razas(nombre)')
    .order('creado_en', { ascending: false })
}

export async function listarClientesSimple() {
  return supabase.from('clientes').select('id, nombre').order('nombre')
}

export async function listarEspecies() {
  return supabase.from('especies').select('id, nombre').order('nombre')
}

export async function listarRazas(especieId: number) {
  return supabase.from('razas').select('id, nombre').eq('especie_id', especieId).order('nombre')
}

export async function crearMascota(m: {
  cliente_id: number
  nombre: string
  especie_id: number
  raza_id: number
  sexo: string
  nacimiento: string
  peso_kg: number
}) {
  return supabase.from('mascotas').insert(m)
}