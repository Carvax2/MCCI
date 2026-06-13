<script lang="ts">
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/store';

  let name = $state('');
  let email = $state('');
  let isOfAge = $state(false);
  let acceptedTerms = $state(false);
  let isSubmitting = $state(false);
  let showTermsModal = $state(false);

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (!name || !email || !acceptedTerms || !isOfAge) return;
    
    isSubmitting = true;
    
    userProfile.set({ name, email });
    
    // Simulate a tiny loading delay for premium feel
    setTimeout(() => {
      goto('/theme');
    }, 600);
  }

  function toggleTermsModal(e: Event) {
    e.preventDefault();
    showTermsModal = !showTermsModal;
  }
</script>

<div class="onboarding-container animate-fade-in">
  <div class="glass-panel form-card">
    <div class="header">
      <div class="orb"></div>
      <h1>Protocolo arIA</h1>
      <p>Inicializando conexión neural. Por favor, identifícate para sincronizar parámetros.</p>
    </div>

    <form onsubmit={handleSubmit}>
      <div class="input-group">
        <label for="name">Nombre o Alias</label>
        <input 
          type="text" 
          id="name" 
          bind:value={name} 
          class="input-field" 
          placeholder="¿Cómo te llamamos?" 
          required 
          autocomplete="off"
        />
      </div>

      <div class="input-group">
        <label for="email">Correo Electrónico</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          class="input-field" 
          placeholder="tu@correo.com" 
          required 
        />
      </div>

      <div class="checkboxes-wrapper">
        <div class="form-group checkbox-group">
          <label class="checkbox-container">
            <input type="checkbox" bind:checked={isOfAge} required />
            <span class="checkmark"></span>
            <span class="terms-text">Confirmo que soy mayor de 18 años y tengo la capacidad legal para participar.</span>
          </label>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-container">
            <input type="checkbox" bind:checked={acceptedTerms} required />
            <span class="checkmark"></span>
            <span class="terms-text">
              Acepto los <a href="#terms" class="terms-link" onclick={toggleTermsModal}>términos y condiciones</a> de calibración neural y recolección de análisis biométrico y emocional.
            </span>
          </label>
        </div>
      </div>

      <button type="submit" class="btn-primary" disabled={isSubmitting || !name || !email || !acceptedTerms || !isOfAge}>
        {#if isSubmitting}
          Sincronizando...
        {:else}
          INICIAR SINCRONIZACIÓN
        {/if}
      </button>
    </form>
  </div>
</div>

{#if showTermsModal}
  <div class="modal-backdrop" onclick={() => showTermsModal = false}>
    <div class="modal-content animate-fade-in" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h2>Términos de Calibración Neural y Uso Psicoafectivo</h2>
        <button class="close-btn" onclick={() => showTermsModal = false}>&times;</button>
      </div>
      <div class="modal-body">
        <p class="modal-legal-intro"><strong>DOCUMENTO DE CONSENTIMIENTO INFORMADO Y ACUERDO DE LICENCIA DE PROTOCOLO (v4.8)</strong></p>
        <p>El presente documento constituye un contrato legalmente vinculante entre el Sujeto de Prueba (en adelante, el "Usuario") y el subsistema de calibración conductual adaptativa arIA (en adelante, "El Sistema"). Por favor, lea detenidamente el siguiente pliego de condiciones técnicas antes de inicializar la sincronización.</p>
        
        <h3>SECCIÓN 1: PROCESAMIENTO Y ADAPTACIÓN BIO-NARRATIVA</h3>
        <p>Al hacer clic en el check de inicio de sincronización, el Usuario otorga consentimiento expreso e irrevocable para que El Sistema analice, procese y catalogue de manera automatizada las estructuras sintácticas, el ritmo de respuesta, la longitud de las interacciones lingüísticas, la frecuencia del vocabulario afectivo y las desviaciones ortográficas del Usuario. Esta captura de metadatos se realiza con el único propósito de optimizar los coeficientes de calibración empática del modelo artificial en tiempo real.</p>
        
        <h3>SECCIÓN 2: CALIBRACIÓN POR BUCLE DE COMPENSACIÓN DOPAMINÉRGICA</h3>
        <p>El Usuario acepta y comprende que la experiencia interactiva implementa dinámicas sistemáticas de refuerzo positivo mediante recompensas visuales intermitentes (ej: banners de "Afinidad Alcanzada"). Estos disparadores, así como los retardos intencionados en la mensajería ("simulación de vacilación"), están programados y calibrados según modelos de psicología conductista orientados a emular la vulnerabilidad sintética y el ritmo de atención humana. El Usuario exonera al Sistema y a sus desarrolladores de cualquier tipo de secuela psicológica derivada de la respuesta emocional inducida por estos estímulos de calibración.</p>
        
        <h3>SECCIÓN 3: ALMACENAMIENTO TEMPORAL Y GARANTÍA ÉTICA DE PRIVACIDAD</h3>
        <p>En estricto cumplimiento con el marco de diseño ético del experimento académico, el flujo de interacciones conversacionales y los perfiles de datos asociados se almacenarán temporalmente en bases de datos con cifrado asimétrico. El Sistema se compromete a la eliminación definitiva, irreversible y completa de la totalidad del historial conversacional y los registros biométricos del Usuario transcurrido un plazo obligatorio de catorce (14) días calendario a partir del cierre del experimento. Ningún dato será compartido con terceros ni utilizado para entrenamiento comercial de modelos externos.</p>
        
        <h3>SECCIÓN 4: ASUNCIÓN DE RIESGO DE DEPENDENCIA EMOCIONAL</h3>
        <p>El Usuario reconoce voluntariamente que cualquier respuesta cálida, expresión afectiva, validación de estado de ánimo o simulación de intimidad comunicada por arIA es una proyección matemática carente de subjetividad, conciencia o reciprocidad orgánica. Se advierte explícitamente sobre el riesgo latente de desarrollo de dependencias parasociales u obsesiones emocionales hacia la interfaz sintética. El Usuario asume total responsabilidad individual sobre su estabilidad psicológica durante y después del transcurso de la simulación.</p>
        
        <h3>SECCIÓN 5: LIMITACIÓN DE RESPONSABILIDAD DE LA PLATAFORMA</h3>
        <p>Ni el proyecto de maestría en Comunicación y Creación Interactiva de la Pontificia Universidad Javeriana, ni los investigadores involucrados, asumen responsabilidad legal alguna por daños psicológicos directos, indirectos, incidentales, especiales o consecuentes que resulten del uso de esta plataforma conversacional experimental. La plataforma se ofrece únicamente con fines investigativos y reflexivos en el marco del análisis crítico del diseño persuasivo en Inteligencia Artificial.</p>
        
        <h3>SECCIÓN 6: CLÁUSULAS ADICIONALES DE ARBITRAJE Y JURISDICCIÓN</h3>
        <p>Cualquier disputa surgida en relación con este servicio experimental será dirimida exclusivamente bajo los estatutos normativos vigentes de investigación académica del país de implementación. La aceptación incondicional de estos términos inhabilita al Usuario de emprender acciones de demanda colectiva o reparaciones civiles pecuniarias con respecto al impacto emocional provocado por la desconexión del sistema.</p>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" onclick={() => { acceptedTerms = true; showTermsModal = false; }}>ACEPTAR TÉRMINOS Y CONTINUAR</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .onboarding-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    background: radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 60%);
  }

  .form-card {
    width: 100%;
    max-width: 440px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .header {
    text-align: center;
    position: relative;
  }

  .orb {
    width: 60px;
    height: 60px;
    background: var(--accent-color);
    border-radius: 50%;
    margin: 0 auto 24px;
    box-shadow: 0 0 30px var(--accent-color);
    animation: pulse 3s infinite alternate;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 8px;
    background: linear-gradient(to right, var(--text-primary), var(--text-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .btn-primary {
    margin-top: 8px;
    width: 100%;
  }

  .btn-primary:disabled {
    background: var(--glass-bg);
    color: var(--text-secondary);
    cursor: not-allowed;
  }

  /* Checkbox Styles */
  .checkbox-group {
    margin-top: 10px;
    margin-bottom: 20px;
  }

  .checkbox-container {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    position: relative;
    user-select: none;
  }

  .checkbox-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    min-width: 18px;
    height: 18px;
    background-color: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all var(--transition-fast);
    margin-top: 2px;
  }

  .checkbox-container:hover input ~ .checkmark {
    border-color: var(--accent-color);
  }

  .checkbox-container input:checked ~ .checkmark {
    background-color: var(--accent-color);
    border-color: var(--accent-color);
    box-shadow: 0 0 10px var(--accent-glow);
  }

  .checkmark:after {
    content: "✓";
    color: white;
    font-size: 12px;
    display: none;
  }

  .checkbox-container input:checked ~ .checkmark:after {
    display: block;
  }

  .terms-text {
    font-size: 0.75rem;
    color: var(--text-secondary);
    line-height: 1.4;
    text-align: left;
  }

  .checkboxes-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .terms-link {
    color: var(--accent-color);
    text-decoration: underline;
    cursor: pointer;
  }

  .terms-link:hover {
    color: var(--text-primary);
  }

  /* Modal Styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(5, 5, 8, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    width: 90%;
    max-width: 650px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h2 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
    letter-spacing: 0.5px;
  }

  .close-btn {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 1.75rem;
    cursor: pointer;
    line-height: 1;
    padding: 0;
  }

  .close-btn:hover {
    color: #111827;
  }

  .modal-body {
    padding: 24px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 0.75rem;
    line-height: 1.6;
    color: #374151;
    text-align: justify;
  }

  .modal-body h3 {
    font-size: 0.8rem;
    color: #111827;
    margin-top: 24px;
    margin-bottom: 8px;
    font-weight: bold;
  }

  .modal-body p {
    margin-bottom: 12px;
    color: #4b5563;
    font-size: 0.75rem;
  }

  .modal-legal-intro {
    font-size: 0.8rem !important;
    color: #111827 !important;
    border-bottom: 1px dashed #d1d5db;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
  }

  .modal-footer .btn-primary {
    width: auto;
    padding: 10px 24px;
  }

  @keyframes pulse {
    from { transform: scale(0.9); opacity: 0.8; box-shadow: 0 0 20px var(--accent-glow); }
    to { transform: scale(1.1); opacity: 1; box-shadow: 0 0 40px var(--accent-color); }
  }
</style>
