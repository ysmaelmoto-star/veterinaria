create type rol_usuario as enum
  ('administrador','recepcionista','veterinario','inventario','grooming');

create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol rol_usuario not null default 'recepcionista',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table especies (
  id int generated always as identity primary key,
  nombre text not null unique
);

create table razas (
  id int generated always as identity primary key,
  especie_id int not null references especies(id),
  nombre text not null,
  unique (especie_id, nombre)
);

create table clientes (
  id bigint generated always as identity primary key,
  nombre text not null,
  dni char(8) not null unique check (dni ~ '^[0-9]{8}$'),
  telefono char(9) not null check (telefono ~ '^[0-9]{9}$'),
  correo text not null check (correo ~ '^\S+@\S+\.\S+$'),
  creado_en timestamptz not null default now()
);

create table mascotas (
  id bigint generated always as identity primary key,
  cliente_id bigint not null references clientes(id) on delete cascade,
  nombre text not null,
  especie_id int not null references especies(id),
  raza_id int not null references razas(id),
  sexo text not null check (sexo in ('Hembra','Macho')),
  nacimiento date not null,
  peso_kg numeric(5,1) not null check (peso_kg > 0),
  foto_url text,
  creado_en timestamptz not null default now()
);