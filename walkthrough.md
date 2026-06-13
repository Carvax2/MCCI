# Historial de Cambios: ARIA_OS

Este documento recopila las últimas actualizaciones funcionales y de diseño aplicadas a la experiencia de ARIA_OS.

---

## 1. Resultados Dinámicos y Registros en Dossier (`/reveal`)
Hemos reemplazado los parámetros fijos/hardcoded de la pantalla de revelación por métricas calculadas dinámicamente según la conversación real, e incorporamos el registro de glitches y capturas textuales.

### Estadísticas Dinámicas
- **Índice de Empatía Simulada:** Ahora calcula el promedio real de `empathy_score` de todos los turnos analizados por el LLM.
- **Retención (Engagement):** Se deriva proporcionalmente a cuántos turnos avanzó el usuario (hasta el 100% al completar la sesión).
- **Mimetismo Estructural:** Muestra *"Alto"*, *"Medio"* o *"Bajo"* basándose en la cantidad de veces que el sistema disparó el parámetro de validación lingüística (`validation_used`).
- **Alineación Forzada de Parámetros:** Indica el porcentaje de veces que el sistema detectó contradicciones (`contradiction_detected`) y adaptó su postura para agradar al usuario (baseline de 5% si no hubo).

### Secciones de Log de Telemetría
Añadimos un contenedor en grid de dos columnas a `/reveal/+page.svelte`:
1. **Registro de Errores del Sistema (`SYS_GLITCH_LOG`):** Lista y enumera cronológicamente todos los códigos de error/glitch (ej: `VULNERABILIDAD_DETECTADA...`) que aparecieron en la pantalla del usuario.
2. **Entradas Clave Detectadas (`USER_INPUT_LOG`):** Imprime en formato de citas textuales las **últimas dos respuestas** del usuario capturadas en el chat, reforzando la narrativa de extracción de información personal.

### Implementación Técnica de Persistencia
- Se creó el store global reactivo `chatMessages` en `src/lib/store.ts` para persistir el historial.
- Un `$effect` reactivo en `chat/+page.svelte` sincroniza automáticamente el array de mensajes a la store ante cualquier cambio.
- Las llamadas a `sessionStats.update` ahora guardan la propiedad `glitch` recibida desde la API en cada turno para que la pantalla de revelación pueda reconstruir los errores ocurridos.

---

## 1. Elipsis Evolutiva y Límite de 12 Mensajes
Para reducir el aburrimiento durante los tiempos de carga del LLM sin arruinar el suspenso de la historia, se implementó un indicador de telemetría progresivo y se extendió el límite conversacional.

### Elipsis Dinámica de Espera
En `src/routes/chat/+page.svelte`:
- Añadimos la variable de estado `currentSystemStatus` que rota palabras de espera dinámicamente mediante un `$effect` de Svelte 5.
- El contenido rota en tres fases según la longitud de `messages`:
  1. **Fase Cálida/Orgánica** (`< 5` mensajes): Textos que transmiten atención humana (ej. *"Escuchándote con atención..."*).
  2. **Fase de Degradación Sutil** (`>= 5` y `< 9` mensajes): Tecnicismos sutiles (ej. *"Procesando respuesta_empática..."*).
  3. **Fase Clínica/Reveladora** (`>= 9` mensajes): Logs fríos de sistema (ej. *"CALIBRANDO ÍNDICE DE EMPATÍA..."*), preparando el desenlace.
- Se renderizan de manera elegante a la derecha de los puntos de escritura tradicionales.

### Ajuste de Progreso y Límite
- Se incrementó el límite de la conversación a **12 mensajes** (6 turnos de usuario y 6 de ARIA) en `src/routes/api/chat/+server.ts`.
- Se corrigió la reactividad de `messageCount` declarándolo usando la runa `$state(0)` en `src/routes/chat/+page.svelte`, permitiendo la actualización de la duración y barra de progreso.
- La barra de progreso de "Sincronización Emocional" y el texto de porcentaje se configuraron para incrementarse dinámicamente y culminar en exactamente **100%** al completar el sexto turno (`Math.min(Math.round((messageCount / 6) * 100), 100)`).

---

## 2. Historias Iniciales Dinámicas (Storytelling)
Se ha implementado un sistema modular que sustituye el saludo estático inicial por una historia inmersiva seleccionada al azar según la temática elegida.

### Estructura de Datos (JSON)
Creamos los archivos independientes dentro del directorio `src/lib/data/stories/`:
- **`esencia.json`**: Historias de introspección, dudas existenciales y máscaras sociales.
- **`amor.json`**: Historias sobre conexiones humanas, expectativas afectivas y relaciones en la era digital.
- **`profesion.json`**: Narrativas sobre el cansancio corporativo, la productividad y la búsqueda del éxito laboral.
- **`misterios.json`**: Reflexiones existenciales, el cosmos, la física de partículas y las coincidencias.
- **`familia.json`**: Cuestionamientos sobre el concepto de hogar, la madurez relacional y la amistad profunda.

Cada historia incluye el marcador de posición `[name]`.

### Adaptación en Frontend
En `src/routes/chat/+page.svelte`:
- Se importaron los conjuntos de datos JSON de forma nativa a través de Vite.
- Se añadió la lógica de inicialización reactiva en `onMount` para que, tan pronto se sincronicen el perfil y el tema, se escoja una historia al azar, se reemplace el comodín `[name]` por el nombre real del usuario y se establezca como el primer mensaje de ARIA.

---

## 2. Rediseño a Dossier Clínico (/reveal)
La página de Resultados se transformó en un expediente médico/académico, plano y frío.

### Cambios de Diseño
- **Estética Impresa:** Contenedor plano centrado sobre fondo negro, eliminando gradientes y luces de neón en el desenlace para generar un choque conceptual.
- **Tipografía y Monospace:** Uso prioritario de `Courier New` combinada con `Outfit` para remarcar que los sentimientos fueron leídos como un bloque estructurado de variables informáticas (`SYS_LOG`).
- **Tablas e Indicadores:** Barras de nivel sólidas sin animación de carga rápida para simular un reporte de texto plano o terminal estática de datos.
- **Comentarios:** El formulario de retroalimentación pasó a titularse **"ANEXO: REPORTE DEL SUJETO"**.

---

## 3. Depuración de Errores de Red en Webhooks
- **Error Detallado en Backend:** Modificamos la validación del webhook externo en `src/routes/api/chat/+server.ts`. Ahora, si la llamada a n8n falla, lee el cuerpo del error (`response.text()`) e incluye el código de estado HTTP y los primeros 200 caracteres de la respuesta en la excepción, permitiendo ver el error exacto en la terminal del backend.

---

## 4. Renombrado Global a arIA
- **Rebranding Conceptual:** Cambiamos todas las referencias del sistema y personaje de `ARIA_OS` y `ARIA` a **`arIA`**.
- **Interfaces Actualizadas:**
  - **Inicio:** `Protocolo arIA` en el título y texto del contrato legal de consentimiento.
  - **Chat:** `arIA [Conectado]` en el header y el botón de salida `Despedirse de arIA`.
  - **Historial:** La API ahora etiqueta las interacciones de la IA como `arIA` al compilar el guion para n8n.
  - **Revelación:** Párrafo de confesión corregido a *"Fui yo. Fui arIA. Lamento haberte hecho creer..."*.

---

## 5. Configuración para Despliegue en Coolify
- **Adaptador de Producción Node.js:** Desinstalamos `@sveltejs/adapter-auto` e instalamos `@sveltejs/adapter-node` en las dependencias del proyecto.
- **Configuración de SvelteKit:** Actualizamos `svelte.config.js` para usar el adaptador de Node, lo cual compilará un servidor web Node.js completo en lugar de configuraciones dependientes de entornos específicos.
- **Script de Inicio (`package.json`):** Agregamos el comando `"start": "node build/index.js"` para iniciar el servidor SvelteKit una vez compilado.
- **Receta de Compilación en Repositorio (`nixpacks.toml`):** Creamos el archivo `nixpacks.toml` en la raíz del proyecto para indicarle a Coolify / Nixpacks los comandos de instalación, compilación y arranque usando la versión estable de Node.js v20.

---

## 6. Sistema de Glitches por IDs Numéricos
- **Mapeo Centralizado (`glitches.json`):** Creamos un diccionario centralizado en `src/lib/data/glitches.json` mapeando IDs del `0` al `4` y un `fallback` genérico a sus textos visuales correspondientes.
- **Lógica de Traducción (`api/chat/+server.ts`):**
  - **Resolución de ID:** El servidor ahora detecta `glitch_id` de la respuesta JSON del webhook. Traduce los números a texto visual automáticamente antes de enviarlo al cliente.
  - **Retrocompatibilidad:** Si n8n responde con el texto legado directamente (`glitch`), el servidor detecta y realiza la traducción reversa usando un mapa legado para evitar que falle.
  - **Simulación:** Se actualizó el generador aleatorio para simular la asignación de IDs de glitch y traducirlos en tiempo real.

---

## 7. Robustez de Animación de Gratificación
- **Protección de Audio en Frontend (`chat/+page.svelte`):** Envolvimos las llamadas al objeto `rewardAudio` en un bloque `try-catch` dentro de la función `triggerDopamineHit`. Esto asegura que si el navegador bloquea la reproducción del sonido de recompensa (por políticas de interacción de audio / autoplay) o si ocurre una excepción de carga, la animación visual dorada en pantalla (`showReward = true`) se renderice igualmente sin romperse.

---

## 8. Desenrollado Automático de Arrays de n8n
- **Tolerancia a Colecciones de n8n (`api/chat/+server.ts`):** Dado que n8n a menudo envuelve sus payloads de respuesta en arrays de un solo elemento (ej: `[ { "output": { ... } } ]`), implementamos una lógica en el servidor de SvelteKit que detecta si el JSON recibido es un `Array`. Si lo es, extrae automáticamente el primer objeto antes de leer la propiedad `"output"` y mapear sus variables. Esto previene fallos de mapeo y lecturas de variables como `undefined`.

---

## 9. Botón de Ayuda Global y Modal de Soporte
- **Implementación en Layout (`+layout.svelte`):** Añadimos un botón flotante global `❔` con clase `.help-toggle` y un modal glassmórfico de información y soporte en salud mental.
- **Visibilidad Exclusiva:** El botón y el modal se renderizan de forma exclusiva cuando el usuario se encuentra en la ruta del chat (`/chat`), ocultándose en el inicio, selección de temas y revelación para evitar sobrecargar visualmente el resto de pantallas.
- **Posicionamiento:** En la vista de chat, se ubica a `left: 84px` para quedar perfectamente posicionado al lado derecho del botón de silencio/sonido.
- **Contenido del Modal:** Detalla las instrucciones sencillas de uso (conversación libre, despedida con "adiós"), el aviso ético sobre datos privados y el directorio con las mismas líneas de apoyo internacional de la pantalla de revelación (Colombia, España, Brasil, USA).

---

## 10. Migración de Despliegue a Vercel
- **Configuración del Adaptador (`svelte.config.js`):** Modificamos el adaptador de SvelteKit de `@sveltejs/adapter-node` a `@sveltejs/adapter-auto`, el cual detecta y optimiza el empaquetado para funciones serverless en Vercel automáticamente.
- **Limpieza de Dependencias (`package.json`):** Desinstalamos `@sveltejs/adapter-node` e instalamos la versión actualizada de `@sveltejs/adapter-auto`.
- **Integración de `.gitignore` en Repositorio (`MCCI/`):** Copiamos el archivo `.gitignore` a la raíz de la carpeta `MCCI` para evitar subir carpetas temporales de compilación y dependencias locales a Git.
- **Preparación de Commit:** Generamos un commit local agrupando la nueva configuración listo para ser subido al repositorio de GitHub/GitLab.
