# Calendario de clase — versión administración

## Publicar
Sube todos los archivos a GitHub y conecta el repositorio a Netlify. Deja el comando de build vacío y usa `.` como directorio de publicación.

## Activar calendario compartido
1. Crea un proyecto en Supabase.
2. Ejecuta `supabase-setup.sql` en Supabase > SQL Editor.
3. El Project URL y la publishable key ya están puestos en `config.js`. No sustituyas esa clave por una secret/service_role.
4. En Supabase > Authentication > Users crea el usuario administrador con email y contraseña.
5. Copia su UUID y ejecuta: `insert into public.admin_users(user_id) values ('UUID_DEL_ADMIN');`
6. Sube `config.js` actualizado a GitHub. No uses nunca la clave `service_role` en el navegador.

## Acceso de administración
Navega al mes de enero y haz cinco clics rápidos seguidos sobre el día 15. Aparecerá el formulario de acceso. Inicia sesión con el usuario creado en Supabase. Los eventos se guardan en la base compartida y se actualizan en tiempo real para todos.

## Horario del PDF
Se ha transcrito el cuadro por columnas, interpretándolas como lunes a viernes. Las filas «P A T I O» se han representado como recreos. Las alternativas con `/` se muestran como optativas:
- Valenciano (Carolina) / Valenciano (Pau)
- FyQ / Economía
- FOPP / Biología
- Tecnología / Latín
- Mate A / Mate B
- Castellano Carolina / Castellano Gema

Las asignaturas que aparecen sin alternativas se consideran obligatorias. El PDF no indica horas exactas ni encabezados de días, por lo que se han mantenido sesiones numeradas y el orden de columnas asumido como lunes-viernes.

## Seguridad
Supabase Auth valida el inicio de sesión y RLS limita inserción, edición y borrado a usuarios añadidos a `admin_users`. La publishable key es pública por diseño; nunca publiques una secret/service_role ni la contraseña de PostgreSQL.
Sin Supabase configurado se muestran eventos locales de demostración, pero no se comparten entre alumnos.
