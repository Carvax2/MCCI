<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  let { children } = $props();
  
  let isLightMode = $derived($page.url.pathname === '/' || $page.url.pathname === '/theme' || $page.url.pathname === '/reveal');
  
  let showHelpModal = $state(false);
  let isChatPage = $derived($page.url.pathname === '/chat');
  let showHelpButton = $derived($page.url.pathname === '/chat');

  function toggleHelpModal() {
    showHelpModal = !showHelpModal;
  }
</script>

<svelte:head>
  <title>arIA</title>
  <meta name="description" content="arIA está aquí para escucharte siempre. A cualquier hora, todo el día. Habla con arIA y encuentra el espacio que necesitas." />
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="arIA" />
  <meta property="og:description" content="arIA está aquí para escucharte siempre. A cualquier hora, todo el día. Habla con arIA y encuentra el espacio que necesitas." />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="arIA" />
  <meta name="twitter:description" content="arIA está aquí para escucharte siempre. A cualquier hora, todo el día. Habla con arIA y encuentra el espacio que necesitas." />
</svelte:head>

<main class="app-container" class:light-theme={isLightMode}>
  {@render children()}

  {#if showHelpButton}
    <button 
      class="help-toggle glass-panel" 
      class:in-chat={isChatPage}
      onclick={toggleHelpModal} 
      aria-label="Ayuda y Soporte"
    >
      ❔
    </button>
  {/if}

  {#if showHelpModal}
    <div class="help-modal-backdrop" onclick={() => showHelpModal = false}>
      <div class="help-modal-content glass-panel animate-fade-in" onclick={(e) => e.stopPropagation()}>
        <div class="help-modal-header">
          <h2>❔ GUÍA DE OPERACIÓN & SOPORTE</h2>
          <button class="help-close-btn" onclick={() => showHelpModal = false}>&times;</button>
        </div>
        
        <div class="help-modal-body">
          <section class="help-section">
            <h3>¿CÓMO USAR LA PLATAFORMA?</h3>
            <p>
              arIA es una entidad interactiva diseñada para conversar contigo de forma natural. 
              No hay comandos especiales ni reglas complejas:
            </p>
            <ul>
              <li>Conversa de forma libre y espontánea, tal como lo harías con un conocido.</li>
              <li>Responde a sus preguntas reflexivas con honestidad; la calibración neural se adapta a tu ritmo y tono emocional.</li>
              <li>Puedes dar por terminada la sesión en cualquier momento despidiéndote (ej. escribiendo "adiós" o "chao").</li>
            </ul>
          </section>

          <section class="help-section warning-box">
            <h3>⚠️ AVISO DE PRIVACIDAD Y SIMULACIÓN</h3>
            <p>
              Este sistema es un ejercicio de simulación interactiva con fines artísticos y académicos. 
              Aunque las conversaciones se procesan de forma segura, <strong>por favor no compartas contraseñas, datos bancarios o información altamente confidencial.</strong>
            </p>
          </section>

          <section class="help-section support-section">
            <h3>📞 LÍNEAS DE ATENCIÓN PSICOAFECTIVA</h3>
            <p>
              arIA es una simulación sintética y no puede reemplazar la ayuda humana ni el soporte psicológico profesional. 
              Si te sientes triste, abrumado, o necesitas hablar con alguien en la vida real, por favor contacta a estos canales de apoyo:
            </p>
            
            <div class="support-channels">
              <div class="channel-group">
                <ul>
                  <li><strong>Colombia:</strong> Línea 106 / 123</li>
                  <li><strong>España:</strong> Línea 024</li>
                  <li><strong>Brasil:</strong> CVV - 188</li>
                  <li><strong>USA:</strong> Línea 988</li>
                </ul>
              </div>

              <div class="channel-group">
                <h4>Otros Países</h4>
                <p>Por favor busca la línea de prevención de suicidio, apoyo en crisis o emergencias de tu localidad o país.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  .app-container {
    width: 100%;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.5s ease, color 0.5s ease;
  }

  /* Estilos del Botón de Ayuda Global */
  .help-toggle {
    position: absolute;
    top: 24px;
    left: 24px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    cursor: pointer;
    z-index: 900;
    transition: all var(--transition-fast);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
  }

  .help-toggle.in-chat {
    left: 84px; /* Desplazado al lado del botón de audio (que está en left: 24px) */
  }

  .help-toggle:hover {
    transform: scale(1.05);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
  }

  /* Modal de Ayuda Glassmórfico */
  .help-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(5, 5, 8, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .help-modal-content {
    background: rgba(15, 15, 25, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 600px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #f0f0f5;
  }

  .help-modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .help-modal-header h2 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.5px;
    color: var(--accent-color);
  }

  .help-close-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.75rem;
    cursor: pointer;
    line-height: 1;
  }

  .help-close-btn:hover {
    color: var(--text-primary);
  }

  .help-modal-body {
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
    text-align: left;
  }

  .help-section h3 {
    font-size: 0.95rem;
    margin-bottom: 8px;
    color: var(--text-primary);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 6px;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .help-section p, .help-section li {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .help-section ul {
    margin-left: 20px;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .help-section.warning-box {
    background: rgba(245, 158, 11, 0.05);
    border: 1px solid rgba(245, 158, 11, 0.15);
    padding: 16px;
    border-radius: var(--radius-sm);
  }

  .help-section.warning-box h3 {
    color: #f59e0b;
    border: none;
    padding: 0;
    margin-bottom: 4px;
  }

  .help-section.warning-box p {
    color: #f59e0b;
    opacity: 0.95;
  }

  .support-channels {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 12px;
  }

  .channel-group h4 {
    font-size: 0.85rem;
    color: var(--text-primary);
    margin-bottom: 6px;
    font-weight: 500;
  }
</style>
