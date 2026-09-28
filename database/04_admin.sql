insert into perfiles (id, nombre, rol)
select id, 'Tu Nombre', 'administrador'
from auth.users
where email = 'admin@clinica.com';