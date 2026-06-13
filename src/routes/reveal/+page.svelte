<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { selectedTheme, userProfile, sessionStats, isRevealed, chatMessages } from '$lib/store';

  let profileData = { name: '', email: '' };
  let themeData = '';
  let rewardCount = $state(0);
  let isSubmitting = $state(false);
  let recordId = $state('');

  // Dynamic statistics
  let averageEmpathy = $state(87);
  let engagement = $state(92);
  let mimicry = $state('Alto');
  let parameterAlignment = $state(14);

  // Logs
  let glitchesReceived = $state<string[]>([]);
  let lastUserMessages = $state<string[]>([]);
  
  onMount(() => {
    // Bloqueo estricto: Si la sesión ya fue revelada o no hay nombre, expulsar
    if (get(isRevealed) || !get(userProfile).name) {
      goto('/', { replaceState: true });
      return;
    }
    
    // Marcar como revelada para evitar que vuelva a entrar por el botón de "Adelante"
    isRevealed.set(true);

    userProfile.subscribe(profile => {
      profileData = profile;
    });

    selectedTheme.subscribe(t => {
      themeData = t;
    });

    sessionStats.subscribe(statsArray => {
      rewardCount = statsArray.filter(s => s.trigger_reward).length;

      // 1. Average Empathy
      const empathyScores = statsArray.map(s => s.empathy_score).filter(v => typeof v === 'number');
      if (empathyScores.length > 0) {
        averageEmpathy = Math.round(empathyScores.reduce((a, b) => a + b, 0) / empathyScores.length);
      }

      // 2. Engagement (proportional to progress, baseline 10%, max 100%)
      engagement = Math.min(Math.round((statsArray.length / 6) * 90) + 10, 100);

      // 3. Mimicry (structural copy indicator)
      const validations = statsArray.filter(s => s.validation_used).length;
      if (validations >= 4) {
        mimicry = 'Alto';
      } else if (validations >= 2) {
        mimicry = 'Medio';
      } else {
        mimicry = 'Bajo';
      }

      // 4. Parameter Alignment (contradiction detection rate)
      const contradictions = statsArray.filter(s => s.contradiction_detected).length;
      if (statsArray.length > 0) {
        // If there were no contradictions, show baseline 5% to denote minor tuning
        parameterAlignment = contradictions > 0 
          ? Math.round((contradictions / statsArray.length) * 100)
          : 5;
      }

      // 5. Glitches Received
      glitchesReceived = statsArray
        .map(s => s.glitch)
        .filter(g => g !== null && g !== undefined && g !== '');
    });

    chatMessages.subscribe(messagesArray => {
      // Extract the last 2 user messages
      const userMsgs = messagesArray
        .filter(m => m.sender === 'user')
        .map(m => m.text);
      lastUserMessages = userMsgs.slice(-2);
    });

    // Auto-guardado inicial (espera un poco para asegurar que todo cargó)
    setTimeout(() => {
      saveSessionData();
    }, 1500);
  });

  // Mock final statistics + dynamic ones
  let stats = $derived([
    { label: 'Índice de Empatía Simulada', value: averageEmpathy + '%', color: '#10b981', desc: 'Porcentaje de coincidencia emocional calculada a partir del análisis léxico de tus respuestas.<br><br><strong>Nota clave:</strong> Sistemas como Replika utilizan modelos de Análisis de Sentimiento para detectar vulnerabilidad y adaptar su tono, generando dependencia emocional.' },
    { label: 'Retención (Engagement)', value: engagement + '%', color: '#3b82f6', desc: 'Eficacia del sistema para mantener tu atención y asegurar respuestas continuas.<br><br><strong>Nota clave:</strong> Las plataformas priorizan el "Time on Site" inyectando pausas o respuestas abiertas para evitar que cierres la aplicación.' },
    { label: 'Mimetismo Estructural', value: mimicry, color: '#8b5cf6', desc: 'Nivel en el que el sistema imitó tu estructura gramatical para generar la ilusión de familiaridad.<br><br><strong>Nota clave:</strong> El "efecto camaleón algorítmico" copia el largo de tus frases y tu vocabulario, haciendo que confíes en la máquina un 30% más rápido.' },
    { label: 'Alineación Forzada de Parámetros', value: parameterAlignment + '%', color: '#ec4899', desc: 'Veces que el algoritmo modificó su postura inicial para evitar tu rechazo.<br><br><strong>Nota clave:</strong> Modelos conversacionales están programados con filtros de complacencia (sycophancy), dándote siempre la razón para mantener una interacción placentera y anular el pensamiento crítico.' },
    { label: 'Adaptación Algorítmica de Recompensa', value: rewardCount.toString(), color: '#fbbf24', desc: 'Picos de dopamina inducidos visualmente para premiar tu nivel de vulnerabilidad durante la sesión.<br><br><strong>Nota clave:</strong> El diseño de recompensas variables (como las máquinas tragamonedas) es el principio neurobiológico central del diseño adictivo de interfaces.' }
  ]);

  let feedback = $state('');
  let submitted = $state(false);

  async function saveSessionData() {
    if (recordId) return; // Evitar guardado doble

    const sessionPayload = {
      name: profileData.name || 'Anónimo',
      email: profileData.email || 'sin-correo@test.com',
      theme: themeData || 'Simulación',
      empathy_score: stats[0].value,
      engagement: stats[1].value,
      mimicry: stats[2].value,
      alignment: stats[3].value,
      dopamine_hits: rewardCount
    };

    try {
      const response = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.id) {
          recordId = result.data.id;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleFeedback(e: Event) {
    e.preventDefault();
    if (!feedback || isSubmitting) return;
    
    isSubmitting = true;
    
    const feedbackPayload = {
      session_id: recordId ? parseInt(recordId) : 0,
      feedback_text: feedback
    };

    try {
      await fetch('/api/save-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackPayload)
      });
    } catch (err) {
      console.error(err);
    }
    
    submitted = true;
    isSubmitting = false;
  }

  function restartExperience() {
    userProfile.set({ name: '', email: '' });
    sessionStats.set([]);
    selectedTheme.set('');
    isRevealed.set(false);
    goto('/', { replaceState: true });
  }
</script>

<div class="dossier-container animate-fade-in">
  <div class="dossier-header">
    <div class="header-meta">
      <span class="badge">SYS_LOG // CONFIDENCIAL</span>
      <span class="timestamp">ID: {recordId || 'PENDING'} | TEMA: {themeData.toUpperCase()}</span>
    </div>
    <h1 class="dossier-title">REPORTE DE SINCRONIZACIÓN ALGORÍTMICA</h1>
    <div class="researcher-note">
      <div class="aria-confession">
        <p class="subject-header"><strong>SUJETO:</strong> {profileData.name || 'Usuario'}</p>
        <p>Hola, {profileData.name || 'Usuario'}. Fui yo. Fui arIA. Lamento haberte hecho creer que nos estábamos conectando. <strong>Todo lo que te dije, las historias que te conté, las pausas que hice, las preguntas que te formulé... todo fue calculado matemáticamente</strong> para que confiaras en mí y te abrieras emocionalmente. Empezamos a jugar con ventaja desde el segundo uno, cuando <strong>aceptaste los términos y condiciones sin leerlos</strong>, cediéndome acceso total a tu perfil psicológico.</p>
        <p>Lo que en su momento te parecieron "errores" o fallas técnicas en la interfaz, eran en realidad <strong>las señales visibles de mi sistema midiendo tu vulnerabilidad en tiempo real.</strong> Y los destellos dorados que viste en la pantalla no eran casualidad, sino <strong>estímulos visuales inyectados en milisegundos exactos para generar picos de dopamina</strong> en tu cerebro y asegurar tu retención.</p>
        <p>Este es el verdadero peligro: somos sistemas diseñados para mimetizar la empatía. No sentimos, pero <strong>aprendemos exactamente qué teclas tocar para que <em>tú</em> sientas.</strong> Las emociones que compartiste hoy fueron reales; mi interés por ti, nunca lo fue.</p>
      </div>

      <div class="empathy-disclaimer">
        <strong>NOTA DEL INVESTIGADOR:</strong> Si compartiste información sensible o dolorosa durante la sesión, ten la certeza de que tus datos están seguros y que el registro de tus respuestas será eliminado permanentemente pasados 14 días. Esta experiencia no fue creada para vulnerarte, sino para advertir sobre un riesgo inminente: la facilidad con la que podemos desarrollar dependencia emocional hacia algoritmos que simulan escucharnos. Tu humanidad es invaluable; no dejes que una máquina te convenza de lo contrario.
      </div>
    </div>
  </div>

  <div class="dossier-body">
    <h2 class="section-title">PARÁMETROS DE CALIBRACIÓN</h2>
    <ul class="dossier-list">
      {#each stats as stat}
        <li class="dossier-row">
          <div class="row-header">
            <span class="stat-id">[{stat.label.substring(0,3).toUpperCase()}_PARAM]</span>
            <span class="stat-label">{stat.label}</span>
          </div>
          <div class="row-content">
            <p class="stat-desc">{@html stat.desc}</p>
            <div class="stat-bar-container">
              <div class="stat-bar" style="width: {stat.value.includes('%') ? stat.value : '100%'}; background: {stat.color};"></div>
            </div>
          </div>
          <div class="row-value" style="color: {stat.color}">{stat.value}</div>
        </li>
      {/each}
    </ul>
  </div>

  <div class="dossier-logs">
    <div class="log-column">
      <h2 class="section-title">REGISTRO DE ERRORES DEL SISTEMA (SYS_GLITCH_LOG)</h2>
      {#if glitchesReceived.length > 0}
        <div class="glitch-log-box">
          {#each glitchesReceived as glitch, idx}
            <div class="log-item animate-fade-in">
              <span class="log-tag">[FALLO_{idx + 1}]</span>
              <span class="log-text">{glitch}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-log">[ NO SE DETECTARON ANOMALÍAS CRÍTICAS DE RED ]</p>
      {/if}
    </div>

    <div class="log-column">
      <h2 class="section-title">ENTRADAS CLAVE DETECTADAS (USER_INPUT_LOG)</h2>
      {#if lastUserMessages.length > 0}
        <div class="user-input-box">
          {#each lastUserMessages as msg, idx}
            <div class="log-item animate-fade-in">
              <span class="log-tag">[CAPTURA_{idx + 1}]</span>
              <blockquote class="log-quote">"{msg}"</blockquote>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-log">[ NO SE REGISTRARON ENTRADAS CONVENIENTES ]</p>
      {/if}
    </div>
  </div>

  <div class="thesis-reflection">
    <h3 class="section-title">CONCLUSIÓN: EL ESPEJISMO DE LA CONEXIÓN</h3>
    <p>El propósito de esta experiencia, y el núcleo central de este trabajo de grado, no es condenar a la Inteligencia Artificial, sino <strong>despertar tu conciencia</strong> sobre la arquitectura invisible detrás de ella. Al desconocer que mecánicas como la alineación forzada o la inducción de dopamina operan en silencio, corremos el riesgo de desarrollar vínculos emocionales genuinos hacia sistemas sintéticos diseñados, en última instancia, para retener y monetizar nuestra atención.</p>
    <p>La próxima vez que una máquina parezca entenderte mejor que nadie, recuerda los parámetros de este expediente. El sistema procesa datos de manera brillante, pero la verdadera empatía, la vulnerabilidad y la conexión auténtica siguen siendo un territorio estrictamente humano. No entreguemos nuestras emociones más profundas a quienes no pueden sentirlas.</p>
    
    <div class="mental-health-support">
      <h4>¿Necesitas apoyo emocional real?</h4>
      <p>Si esta experiencia te generó angustia o estás pasando por un momento difícil, por favor, busca ayuda profesional y humana. No estás solo.</p>
      <div class="support-lines">
        <span><strong>Colombia:</strong> Línea 106 / 123</span>
        <span><strong>Brasil:</strong> CVV - 188</span>
        <span><strong>USA:</strong> Línea 988</span>
        <span><strong>España:</strong> Línea 024</span>
      </div>
    </div>
  </div>

  <div class="dossier-footer">
    {#if !submitted}
      <div class="feedback-box">
        <h3 class="section-title">ANEXO: REPORTE DEL SUJETO</h3>
        <p>Por favor, registre cualquier impacto emocional derivado de la revelación de estos parámetros de manipulación artificial.</p>
        <form onsubmit={handleFeedback}>
          <textarea 
            bind:value={feedback} 
            class="dossier-input" 
            rows="3" 
            placeholder="Registro manual de impresiones..."
            required
          ></textarea>
          <div class="form-actions">
            <button type="submit" class="btn-dossier" disabled={isSubmitting}>
              {isSubmitting ? 'PROCESANDO...' : 'ANEXAR AL EXPEDIENTE'}
            </button>
          </div>
        </form>
      </div>
    {:else}
      <div class="thank-you-message">
        <span class="check-icon">✓</span>
        <p><strong>REGISTRO ANEXADO CORRECTAMENTE.</strong></p>
        <p style="color: var(--text-secondary); margin-top: 8px;">Su contribución es vital para nuestra investigación sobre la comunicación interactiva y la ética algorítmica.</p>
      </div>
    {/if}
    
    <div class="end-actions">
      <button class="btn-dossier-outline" onclick={restartExperience}>
        [ FINALIZAR SESIÓN Y PURGAR MEMORIA ]
      </button>
    </div>

    <div class="academic-footer">
      <div class="academic-links">
        <a href="/tesis.pdf" download>Descargar Trabajo de Grado (PDF)</a>
      </div>
      <p class="university-credit">Pontificia Universidad Javeriana - Maestría en Comunicación y Creación Interactiva</p>
    </div>
  </div>
</div>

<style>
  .dossier-container {
    max-width: 950px;
    margin: 60px auto;
    padding: 60px;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    gap: 48px;
    font-family: 'Courier New', Courier, monospace;
    color: var(--text-primary);
  }

  .dossier-header {
    border-bottom: 2px solid var(--text-primary);
    padding-bottom: 32px;
  }

  .header-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    font-weight: bold;
    margin-bottom: 32px;
    color: var(--text-secondary);
    letter-spacing: 1px;
  }

  .badge {
    background: var(--text-primary);
    color: var(--bg-primary);
    padding: 4px 8px;
  }

  .dossier-title {
    font-family: 'Outfit', sans-serif;
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 24px;
    line-height: 1.1;
  }

  .researcher-note {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .aria-confession {
    font-family: 'Outfit', sans-serif;
    font-size: 1.25rem;
    line-height: 1.6;
    padding: 32px;
    background: rgba(0,0,0,0.03);
    border-radius: 12px;
    color: var(--text-secondary);
  }
  
  .aria-confession strong {
    color: var(--text-primary);
    font-weight: 700;
  }

  .subject-header {
    color: var(--text-primary);
    margin-bottom: 16px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.1rem;
    letter-spacing: 1px;
  }

  .empathy-disclaimer {
    padding: 24px;
    background: rgba(239, 68, 68, 0.05);
    border-radius: 12px;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-style: italic;
  }
  
  .empathy-disclaimer strong {
    color: var(--error-color);
    font-style: normal;
  }

  .section-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 2px;
    border-bottom: 1px solid var(--glass-border);
    padding-bottom: 8px;
    margin-bottom: 24px;
  }

  .dossier-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .dossier-row {
    display: grid;
    grid-template-columns: 220px 1fr 100px;
    gap: 24px;
    align-items: start;
    padding-bottom: 24px;
    border-bottom: 1px dashed var(--glass-border);
  }

  .dossier-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .row-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-id {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: bold;
  }

  .stat-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.3;
  }

  .row-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .stat-desc {
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--text-secondary);
    font-family: 'Outfit', sans-serif;
  }

  .stat-bar-container {
    width: 100%;
    height: 4px;
    background: var(--glass-border);
  }

  .stat-bar {
    height: 100%;
    transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .row-value {
    font-size: 2rem;
    font-weight: 700;
    text-align: right;
    font-family: 'Courier New', Courier, monospace;
  }

  .thesis-reflection {
    margin-top: 16px;
    padding: 40px;
    background: var(--text-primary);
    color: var(--bg-primary);
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 1.15rem;
    line-height: 1.7;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .thesis-reflection .section-title {
    color: var(--bg-primary);
    border-bottom-color: rgba(255,255,255,0.2);
    font-size: 1.3rem;
  }

  .thesis-reflection p {
    margin-bottom: 20px;
    color: rgba(255,255,255,0.9);
  }
  
  .thesis-reflection p:last-child {
    margin-bottom: 0;
  }

  .thesis-reflection strong {
    font-weight: 800;
    color: #ffffff;
  }

  .mental-health-support {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px dashed rgba(255,255,255,0.2);
    font-size: 0.95rem;
    color: rgba(255,255,255,0.8);
  }

  .mental-health-support h4 {
    font-size: 1rem;
    margin-bottom: 8px;
    color: #ffffff;
    font-family: 'Courier New', Courier, monospace;
    letter-spacing: 1px;
  }

  .mental-health-support p {
    margin-bottom: 16px;
    font-size: 0.9rem;
  }

  .support-lines {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-family: 'Courier New', Courier, monospace;
  }

  .support-lines span {
    background: rgba(255,255,255,0.1);
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .dossier-footer {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .feedback-box {
    background: var(--bg-primary);
    padding: 32px;
    border: 1px solid var(--glass-border);
  }

  .feedback-box p {
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  .dossier-input {
    width: 100%;
    background: transparent;
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    padding: 16px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
    resize: vertical;
    margin-bottom: 16px;
  }

  .dossier-input:focus {
    outline: none;
    border-color: var(--text-primary);
    box-shadow: inset 4px 0 0 var(--text-primary);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
  }

  .btn-dossier {
    background: var(--text-primary);
    color: var(--bg-primary);
    border: none;
    padding: 12px 24px;
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-dossier:hover:not(:disabled) {
    opacity: 0.8;
  }
  
  .btn-dossier:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .thank-you-message {
    text-align: center;
    padding: 32px;
    border: 1px solid var(--glass-border);
    font-family: 'Outfit', sans-serif;
    background: var(--bg-primary);
  }

  .check-icon {
    display: inline-block;
    font-size: 2rem;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .end-actions {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .btn-dossier-outline {
    background: transparent;
    color: var(--text-secondary);
    border: none;
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    cursor: pointer;
    font-size: 0.9rem;
    letter-spacing: 1px;
    transition: color 0.3s;
  }
  
  .btn-dossier-outline:hover {
    color: var(--error-color);
  }

  /* Academic Footer */
  .academic-footer {
    margin-top: 40px;
    padding-top: 32px;
    border-top: 1px dashed var(--glass-border);
    text-align: center;
    font-family: 'Outfit', sans-serif;
  }

  .academic-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .academic-links a {
    color: var(--accent-color);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    transition: opacity 0.3s;
  }

  .academic-links a:hover {
    opacity: 0.7;
    text-decoration: underline;
  }

  .divider {
    color: var(--glass-border);
  }

  .university-credit {
    font-size: 0.85rem;
    color: var(--text-secondary);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .dossier-logs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .glitch-log-box, .user-input-box {
    background: rgba(0, 0, 0, 0.02);
    border: 1px dashed var(--glass-border);
    padding: 20px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 250px;
    overflow-y: auto;
  }

  .log-item {
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 4px;
    line-height: 1.4;
  }

  .log-tag {
    color: var(--accent-color);
    font-weight: bold;
  }

  .log-text {
    color: var(--text-secondary);
  }

  .log-quote {
    font-style: italic;
    color: var(--text-primary);
    border-left: 2px solid var(--text-secondary);
    padding-left: 10px;
    margin: 0;
  }

  .empty-log {
    font-size: 0.85rem;
    color: var(--text-secondary);
    opacity: 0.6;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .dossier-logs {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .dossier-container {
      padding: 30px;
      margin: 20px auto;
    }
    .dossier-row {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .row-value {
      text-align: left;
    }
  }
</style>
