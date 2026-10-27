# Panel editorial de Sala de Prensa

El directorio `admin/` se publica como un segundo sitio de Netlify desde el mismo repositorio: base directory `admin`, publish directory `.`.

1. Activar Netlify Identity en el sitio del panel y configurar registro por invitación.
2. Habilitar Git Gateway y limitar el acceso a las cuentas editoras invitadas.
3. Mantener la cuenta propietaria como única administradora del repositorio y Netlify; activar 2FA.
4. Cada guardado escribe directamente en `main` y dispara un despliegue del sitio público. No hay borradores.
5. Las imágenes y videos propios se guardan en `public/uploads/`. Todo archivo cargado se vuelve público luego del despliegue.

Cuando exista el dominio, el panel puede usar `admin.lanusaladeprensa.com`. Hasta entonces, Netlify asignará una URL temporal.

## Optimización automática de fotos

El panel usa Decap CMS 3.17.3, con procesamiento nativo de imágenes activado.
Las nuevas cargas JPEG (incluidos JFIF con MIME JPEG), PNG y WebP se convierten
a WebP con calidad 82 antes de guardarse en GitHub. Se quitan metadatos y se
conservan las dimensiones y proporciones, sin recortar ni agrandar imágenes.
El procesamiento se aplica a las cargas de la biblioteca, imagen principal,
galerías e imágenes insertadas en el cuerpo de la noticia.

La referencia se actualiza automáticamente a la extensión `.webp`. Solo se
sube la versión procesada; el archivo del equipo del editor no se modifica.
El resultado depende de la imagen y no garantiza un tamaño fijo en KB.

Las imágenes ya publicadas, los enlaces externos y los archivos seleccionados
de la biblioteca existente no se reprocesan. GIF, SVG y otros formatos no
admitidos se conservan, y los videos no se transforman. No se fija un ancho
porque la implementación nativa fuerza el tamaño y puede agrandar fotos
pequeñas; un límite de lado mayor requeriría procesamiento adicional.

El compresor WebP de Decap carga recursos desde `unpkg.com`; la política CSP
del panel permite esa conexión. La vista previa personalizada sigue registrada
mediante las funciones globales de Decap.

## Subir videos

En Noticias → Videos, agregá un elemento y elegí **Archivo propio**. En
**Archivo de video o enlace**, abrí la biblioteca y subí o seleccioná el video.
Se recomienda MP4 con video H.264 y audio AAC por compatibilidad con navegadores.
El campo admite archivos de hasta 25 MiB; para videos más grandes usá un enlace
de YouTube o un archivo alojado en un servicio externo.

El CMS guarda el archivo en `public/uploads/` y completa automáticamente la
referencia, por ejemplo `/uploads/entrevista.mp4`. Al guardar la noticia y
terminar el despliegue, queda accesible en
`https://lanusaladeprensa.com/uploads/entrevista.mp4` y se muestra con controles
de reproducción dentro de la nota. La vista previa del CMS usa el archivo
seleccionado, incluso antes de publicarlo.

Una ruta como `C:\Videos\entrevista.mp4`, `file:///...` o un nombre sin subir
el archivo no lo publica. Una ruta `/uploads/...` solo funciona si el archivo
ya existe en el sitio.

Para YouTube o Instagram, elegí ese tipo y usá **Insertar desde URL** en el
mismo selector. Esos videos se muestran como enlaces a la plataforma.
