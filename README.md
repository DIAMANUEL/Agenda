# Calendario de clase

## Supabase
1. Ejecuta `supabase-setup.sql` en SQL Editor.
2. Crea el usuario en Authentication > Users con Auto confirm.
3. Añade su UUID a `admin_users` si todavía no lo has hecho:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email='TU_CORREO'
on conflict (user_id) do nothing;
```

La configuración de Supabase está en `config.js`.

## Nuevas funciones
- Asignatura en eventos mediante desplegable.
- Colores configurables por asignatura desde el modo administrador.
- Horario con clases de 55 minutos: 08:00–08:55, 08:55–09:50, recreo 09:50–10:15, 10:15–11:10, 11:10–12:05, 12:05–13:00, recreo 13:00–13:20, 13:20–14:15, 14:15–15:10.
- Sección Libros para visualizar PDFs.
- El administrador puede subir PDFs directamente a Supabase Storage.
