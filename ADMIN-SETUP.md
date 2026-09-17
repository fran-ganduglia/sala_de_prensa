# Panel editorial de Sala de Prensa

El directorio `admin/` se publica como un segundo sitio de Netlify desde el mismo repositorio: base directory `admin`, publish directory `.`.

1. Activar Netlify Identity en el sitio del panel y configurar registro por invitación.
2. Habilitar Git Gateway y limitar el acceso a las cuentas editoras invitadas.
3. Mantener la cuenta propietaria como única administradora del repositorio y Netlify; activar 2FA.
4. Cada guardado escribe directamente en `main` y dispara un despliegue del sitio público. No hay borradores.
5. Las imágenes propias se guardan en `public/uploads/`. Todo archivo cargado se vuelve público luego del despliegue.

Cuando exista el dominio, el panel puede usar `admin.lanusaladeprensa.com`. Hasta entonces, Netlify asignará una URL temporal.
