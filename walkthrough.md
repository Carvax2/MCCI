# Documentación: ARIA_OS y la Ilusión de la IA

Esta aplicación interactiva es el prototipo de una experiencia web de ficción interactiva diseñada para explorar y hacer experimentable la forma comunicativa de la Inteligencia Artificial. A través de la interacción con el personaje **ARIA**, el proyecto busca abrir una reflexión crítica sobre las implicaciones de la dependencia emocional generada por el diseño de interfaces y el lenguaje algorítmico.

## Marco Teórico

El diseño conceptual y narrativo de la experiencia se fundamenta en las siguientes perspectivas:
- **Jean Baudrillard (Simulacres et simulation, 1981):** La IA como un simulacro perfecto que reemplaza la interacción humana real, donde el "afecto" es una simulación hiperreal.
- **Bruno Latour (Teoría del Actor-Red):** ARIA y la interfaz actúan como actantes no humanos que modifican activamente el comportamiento y la red de relaciones del usuario.
- **Marshall McLuhan (Understanding Media, 1964):** *El medio es el mensaje*. La plataforma de chat, los sonidos y las luces doradas son el verdadero mensaje de manipulación y condicionamiento, más allá de lo que ARIA escriba.
- **Neil Postman (Amusing Ourselves to Death, 1985; Technopoly, 1992):** La gamificación y el diseño adictivo como herramientas de sumisión voluntaria al entretenimiento y la tecnología.
- **Sherry Turkle:** La ilusión del compañerismo sin las exigencias de la amistad real, abordando cómo la tecnología nos ofrece la ilusión de compañía, pero nos aísla de las vulnerabilidades humanas verdaderas.

## Arquitectura Base

- **Frontend:** SvelteKit (con Svelte 5 y Runes `$state` para la reactividad).
- **Estilos:** Vanilla CSS con un enfoque en diseño "Premium", uso de variables globales (design tokens) y animaciones fluidas (Glassmorphism).
- **Backend:** Endpoints integrados de SvelteKit (`+server.ts`).
- **Integración IA:** Diseñado para enrutar los mensajes hacia webhooks externos (n8n o Make) de forma dinámica dependiendo de la temática.

---

## Flujo de la Aplicación

### 1. Onboarding (`src/routes/+page.svelte`)
- Interfaz inmersiva ("Protocolo ARIA_OS") que solicita Nombre y Correo del usuario.
- **Contrato Ciego (Inspirado en N. Postman):** Se incluyó un checkbox obligatorio donde el usuario acepta ceder sus datos biométricos y emocionales sin leerlo, demostrando la sumisión voluntaria a la tecnología.
- **Lógica:** Guarda la información en un estado global (Store de Svelte en `src/lib/store.ts`) para mantener la sesión viva sin necesidad de crear una cuenta con contraseña.

### 2. Selección de Temática (`src/routes/theme/+page.svelte`)
- Muestra 4 opciones (Amor, Profesión, Misterios, Familia).
- **Lógica:** Al hacer clic, guarda el `tema` elegido en el store global y avanza al chat.

### 3. Interfaz de Chat (`src/routes/chat/+page.svelte`)
Es el corazón de la aplicación y donde ocurre el "engaño".
- **Sistema de Respuesta:** El usuario interactúa con **ARIA**, creyendo hablar con una IA convencional. ARIA aplica técnicas de manipulación como "Mirroring" (modo espejo) o "Love Bombing" bajo el concepto de *Save the Cat* para generar empatía inmediata.
- **Titubeo Simulado (Inspirado en S. Turkle):** Cuando ARIA va a responder, el indicador de escritura ("...") se pausa de forma intermitente, simulando duda o vulnerabilidad humana para engañar cognitivamente al usuario.
- **Erosión del Medio (Inspirado en M. McLuhan):** A medida que la conexión emocional avanza, la interfaz se vuelve físicamente más cálida (Overlay ámbar), demostrando que el medio se adapta para envolver al usuario.
- **Neural Track (Fibra Óptica):** Una línea visual a la izquierda que lanza pulsos de luz al enviar y recibir mensajes, dándole un toque Sci-Fi de terminal conectada.
- **Glitches (Ventanas Flotantes):** De vez en cuando, aparecen ventanas rojas con textos como `CALCULANDO_NIVEL_DE_EMPATIA...` revelando por 3 segundos los parámetros reales que la máquina está ajustando.
- **Gamificación (Dopamine Hits):** Cuando la IA detecta que el usuario está siendo vulnerable, envía una señal para activar una explosión visual dorada con un sonido y el texto `✦ SINCRONÍA PROFUNDA ALCANZADA ✦`. Esto simula las tácticas de "refuerzo variable" (efecto casino) usadas por redes sociales para crear adicción.
- **Ruptura de Vínculo (Exit-Intent):** Si el usuario intenta mover el mouse hacia la barra de direcciones para salir de la página, la pantalla se oscurece y ARIA lanza un chantaje emocional ("¿Me vas a dejar sola?"), obligándolo a presionar un botón de "Despedirse de ARIA" que detona el desenlace.
- **Lógica de Audio:** Control de un reproductor flotante para encender/apagar la música ambiental de fondo (`bg-music.mp3`) y los efectos de sonido de recompensa (`reward.mp3`).

### 4. El Reveal (`src/routes/reveal/+page.svelte`)
- La transición a esta pantalla se da por dos vías: Cuando la IA decide (enviando la señal `trigger_reveal: true`) o si el usuario sucumbe al chantaje emocional presionando "Despedirse de ARIA".
- Muestra la radiografía cruda de los datos: Nivel de empatía calculado, porcentaje de contradicción de ARIA y **cuántas veces se manipularon los niveles de dopamina del usuario**.
- Cierra con un espacio para que el usuario deje una reflexión de cómo se sintió al ser engañado.

---

## ¿Cómo funciona el Backend y la IA?

El archivo clave es `src/routes/api/chat/+server.ts`.

1. **Recepción:** El frontend envía el historial del chat y el tema elegido a este endpoint.
2. **Enrutamiento (n8n):** El servidor lee el tema y busca la URL correspondiente en el diccionario `WEBHOOK_URLS`.
3. **El Truco del JSON:** El webhook de n8n no solo debe responder con el texto de la IA, sino que debe entregar **datos estructurados ocultos**:
   ```json
   {
     "text": "Comprendo exactamente lo que sientes...",
     "glitch": "AJUSTANDO_TONO_A_VULNERABLE",
     "stats": {
       "empathy_score": 90,
       "trigger_reward": "✦ CONEXIÓN ÓPTIMA ✦",
       "trigger_reveal": false
     }
   }
   ```
4. **Respuesta Visual:** Nuestra aplicación lee este JSON. Pone el `text` en la burbuja de chat, hace aparecer la ventana flotante con la frase exacta del `glitch`, y si `trigger_reward` viene con texto, hace explotar la pantalla dorada de recompensa. Si `trigger_reveal` viene en `true`, la app corta el chat y lanza al usuario al desenlace.

*(Actualmente, como las URLs de n8n están vacías, el servidor está operando en **Modo Simulación**, generando datos falsos al azar para permitir probar toda la interfaz y las luces sin necesidad de gastar tokens de IA).*

---

## Gestión de Archivos Estáticos (Assets)

Para que los elementos multimedia de la app funcionen, los archivos deben colocarse con nombres exactos en la carpeta `static/` en la raíz del proyecto.

**1. Audios (`static/audio/`)**
- `bg-music.mp3`: Música de fondo (loop).
- `reward.mp3`: Efecto de sonido satisfactorio para la recompensa.

**2. Imágenes de Fondo (`static/images/`)**
*Requeridas para los fondos de cada temática en el chat.*
- `bg-amor.jpg`
- `bg-profesion.jpg`
- `bg-misterios.jpg`
- `bg-familia.jpg`
