# Calendario de clase

## Publicar con GitHub y Netlify
1. Sube el contenido de esta carpeta a un repositorio de GitHub.
2. En Netlify, crea un sitio nuevo importando ese repositorio.
3. Deja vacíos el comando de build y el directorio de publicación (o usa `.` como directorio).
4. Publica. Netlify servirá el sitio mediante HTTPS.

## Personalizar
- Eventos: edita el objeto `events` al principio de `app.js`. Las fechas usan `AAAA-MM-DD`.
- Asignaturas: edita el array `subjects`.
- Horario: edita el array `schedule`. Los nombres de asignatura deben coincidir con `subjects`.
- Las optativas elegidas se guardan en el `localStorage` de cada navegador.

## PWA y notificaciones
Se incluye manifest y Service Worker para instalación y caché offline básica. Los iconos incluidos son provisionales.
El botón de notificaciones solicita permiso y muestra una notificación de prueba. Para enviar recordatorios programados a los alumnos incluso con la web cerrada hace falta implementar Web Push: backend, almacenamiento de suscripciones, claves VAPID y un proceso programado de envío.
