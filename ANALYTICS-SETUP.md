# Clics en publicidades de auspiciantes

La web envía el evento `sponsor_click` a GA4 (`G-ZSX50KY090`) cuando alguien
abre un enlace marcado de Naturaleza Viva, Agencia Salvador, La Fontecita u OPJ.
Incluye clics en las imágenes, botones del sitio e Instagram, y clics con el
botón central. No modifica la navegación ni mide clics de AdSense.

La medición funciona en producción después de publicar el cambio. No recupera
clics anteriores; los bloqueadores pueden impedir su registro. No registra
impresiones ni calcula CTR.

## Configuración en Google Analytics

En Administrar → Visualización de datos → Definiciones personalizadas, crear
estas dimensiones con ámbito **Evento** (rol Editor o Administrador):

| Nombre | Parámetro del evento |
| --- | --- |
| Auspiciante | `sponsor_name` |
| Ubicacion del anuncio | `sponsor_placement` |
| Enlace del anuncio | `sponsor_link` |

No hace falta crear manualmente el evento ni marcarlo como evento clave.
`link_url` ya corresponde a la dimensión integrada URL del enlace. La página
de origen se obtiene de las dimensiones habituales de página de GA4.

## Informe por auspiciante

1. Explorar → Crear exploración de formato libre.
2. Importar dimensiones: Auspiciante, Nombre del evento y, opcionalmente,
   Ubicacion del anuncio, Enlace del anuncio, URL del enlace y Ruta de la página
   y clase de pantalla.
3. Importar métricas: Número de eventos y Total de usuarios.
4. En Filas, agregar Auspiciante. En Valores, Número de eventos y Total de usuarios.
5. Filtrar Nombre del evento **coincide exactamente con** `sponsor_click`.
6. Guardar como “Clics en auspiciantes” y elegir el período a consultar.

Número de eventos cuenta clics; Total de usuarios cuenta los usuarios
identificados por Analytics que hicieron clic. Un usuario puede hacer varios
clics. El filtro evita sumar también el evento automático `click` de enlaces
externos y contar dos eventos para una misma interacción.

En Tiempo real o DebugView se puede verificar el evento tras abrir un enlace
de un auspiciante. Las dimensiones personalizadas pueden tardar 24–48 horas
en estar disponibles en informes después de crearlas y enviar datos.

Referencias:

- https://developers.google.com/analytics/devguides/collection/ga4/events
- https://support.google.com/analytics/answer/14239696?hl=es
