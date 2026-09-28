create or replace function public.mi_rol()
returns rol_usuario
language sql stable security definer
set search_path = public
as $$ select rol from perfiles where id = auth.uid() and activo $$;

alter table perfiles enable row level security;
create policy perfiles_ver on perfiles for select to authenticated
  using (id = auth.uid() or mi_rol() = 'administrador');
create policy perfiles_admin on perfiles for all to authenticated
  using (mi_rol() = 'administrador') with check (mi_rol() = 'administrador');

alter table especies enable row level security;
create policy especies_leer on especies for select to authenticated using (true);
create policy especies_admin on especies for all to authenticated
  using (mi_rol() = 'administrador') with check (mi_rol() = 'administrador');

alter table razas enable row level security;
create policy razas_leer on razas for select to authenticated using (true);
create policy razas_admin on razas for all to authenticated
  using (mi_rol() = 'administrador') with check (mi_rol() = 'administrador');

alter table clientes enable row level security;
create policy clientes_leer on clientes for select to authenticated
  using (mi_rol() in ('administrador','recepcionista','veterinario'));
create policy clientes_crear on clientes for insert to authenticated
  with check (mi_rol() in ('administrador','recepcionista'));
create policy clientes_editar on clientes for update to authenticated
  using (mi_rol() in ('administrador','recepcionista'))
  with check (mi_rol() in ('administrador','recepcionista'));
create policy clientes_borrar on clientes for delete to authenticated
  using (mi_rol() = 'administrador');

alter table mascotas enable row level security;
create policy mascotas_leer on mascotas for select to authenticated
  using (mi_rol() in ('administrador','recepcionista','veterinario'));
create policy mascotas_crear on mascotas for insert to authenticated
  with check (mi_rol() in ('administrador','recepcionista'));
create policy mascotas_editar on mascotas for update to authenticated
  using (mi_rol() in ('administrador','recepcionista'))
  with check (mi_rol() in ('administrador','recepcionista'));
create policy mascotas_borrar on mascotas for delete to authenticated
  using (mi_rol() = 'administrador');