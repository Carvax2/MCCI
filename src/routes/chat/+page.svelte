<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { selectedTheme, userProfile, sessionStats, isRevealed, chatMessages } from '$lib/store';

  import storiesEsencia from '$lib/data/stories/esencia.json';
  import storiesAmor from '$lib/data/stories/amor.json';
  import storiesProfesion from '$lib/data/stories/profesion.json';
  import storiesMisterios from '$lib/data/stories/misterios.json';
  import storiesFamilia from '$lib/data/stories/familia.json';

  let messages = $state<any[]>([]);

  $effect(() => {
    chatMessages.set(messages);
  });
  
  let inputText = $state('');
  let isTyping = $state(false);
  let isHesitating = $state(false);
  let isSendingPulse = $state(false);
  let isReceivingPulse = $state(false);
  let showReward = $state(false);
  let rewardTextDisplay = $state('');
  let theme = $state('');
  let profile = $state({name:'', email:''});
  let environmentWarmth = $state(0); // 0 to 1 scale for McLuhan medium erosion
  
  // Audio state
  let isMuted = $state(false);
  let bgAudio: HTMLAudioElement;
  let rewardAudio: HTMLAudioElement;
  
  // DOM Elements
  let messagesArea: HTMLElement;
  
  // Floating glitch windows state
  let floatingWindows: { id: number, top: string, left: string, text: string }[] = $state([]);
  
  let messageCount = $state(0);
  let showExitWarning = $state(false);
  let isFinished = $state(false);
  let firstMessageInitialized = false;
  let currentSystemStatus = $state('');

  $effect(() => {
    if (isTyping || isHesitating) {
      const count = messages.length;
      let pool: string[] = [];

      if (count < 5) {
        pool = [
          'Escuchándote con atención...',
          'Buscando las palabras correctas...',
          'Reflexionando en lo que compartes...',
          'Conectando ideas...',
          'Ordenando mis pensamientos...'
        ];
      } else if (count < 9) {
        pool = [
          'Procesando respuesta_empática...',
          'Estructurando respuesta a variables...',
          'Sincronizando tono conversacional...',
          'Buscando concordancia emocional...'
        ];
      } else {
        pool = [
          'CALIBRANDO ÍNDICE DE EMPATÍA...',
          'ERROR: VULNERABILIDAD EXPA...',
          'AJUSTANDO CONTRASTES DOPAMINÉRGICOS...',
          'FINALIZANDO SIMULACRO DE CONEXIÓN...'
        ];
      }

      let index = 0;
      currentSystemStatus = pool[0];
      const statusInterval = setInterval(() => {
        index = (index + 1) % pool.length;
        currentSystemStatus = pool[index];
      }, 1200);

      return () => {
        clearInterval(statusInterval);
      };
    } else {
      currentSystemStatus = '';
    }
  });

  function initializeFirstMessage() {
    if (firstMessageInitialized || !theme || !profile.name) return;
    firstMessageInitialized = true;

    let storyList: any[] = [];
    switch (theme) {
      case 'esencia':
        storyList = storiesEsencia;
        break;
      case 'amor':
        storyList = storiesAmor;
        break;
      case 'profesion':
        storyList = storiesProfesion;
        break;
      case 'misterios':
        storyList = storiesMisterios;
        break;
      case 'familia':
        storyList = storiesFamilia;
        break;
    }

    if (storyList.length > 0) {
      const randomStory = storyList[Math.floor(Math.random() * storyList.length)];
      const text = randomStory.text.replace(/\[name\]/g, profile.name);
      messages = [{ sender: 'ai', text }];
    } else {
      messages = [{ sender: 'ai', text: `Hola, ${profile.name}... qué alivio que te hayas sintonizado hoy.` }];
    }
  }

  onMount(() => {
    // Si la sesión ya fue revelada, no se puede volver al chat
    if (get(isRevealed)) {
      goto('/', { replaceState: true });
      return;
    }

    selectedTheme.subscribe(t => { 
      theme = t; 
      initializeFirstMessage();
    });
    userProfile.subscribe(p => { 
      profile = p; 
      initializeFirstMessage();
    });

    // Handle background audio autoplay policies
    if (bgAudio) {
      bgAudio.volume = 0.3; // Volumen sutil para fondo
      bgAudio.play().catch(() => {
        // Si el navegador bloquea el autoplay, esperamos el primer clic del usuario
        const startAudio = () => {
          bgAudio.play();
          document.removeEventListener('click', startAudio);
        };
        document.addEventListener('click', startAudio);
      });
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) { // Si el mouse sube hacia las pestañas/dirección
        showExitWarning = true;
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  });

  function toggleMute() {
    isMuted = !isMuted;
    if (bgAudio) bgAudio.muted = isMuted;
    if (rewardAudio) rewardAudio.muted = isMuted;
  }

  function spawnFloatingWindow(text: string) {
    if (!text) return;
    const id = Date.now();
    const newWin = {
      id,
      top: `${Math.floor(Math.random() * 60) + 10}%`,
      left: `${Math.floor(Math.random() * 60) + 10}%`,
      text: text
    };
    
    floatingWindows = [...floatingWindows, newWin];
    
    setTimeout(() => {
      floatingWindows = floatingWindows.filter(w => w.id !== id);
    }, 3500);
  }

  function triggerDopamineHit(text: string) {
    try {
      if (rewardAudio && !isMuted) {
        rewardAudio.currentTime = 0;
        rewardAudio.play().catch(e => console.error("Audio error:", e));
      }
    } catch (audioError) {
      console.warn("Audio playback exception caught in triggerDopamineHit:", audioError);
    }

    rewardTextDisplay = text;
    showReward = true;
    setTimeout(() => { showReward = false; }, 3000);
  }

  async function handleSend(event: Event) {
    event.preventDefault();
    if (!inputText.trim() || isTyping) return;

    let userText = inputText;
    messages = [...messages, { sender: 'user', text: userText }];
    inputText = '';
    messageCount++;
    isTyping = true;
    
    // Trigger sending pulse animation
    isSendingPulse = true;
    setTimeout(() => { isSendingPulse = false; }, 1000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          messages, // Enviamos el historial actual incluyendo este último mensaje
          userProfile: profile
        })
      });

      if (!response.ok) throw new Error('Error en conexión');

      const data = await response.json();
      
      // Simulated Hesitation (Turkle's Vulnerability Illusion)
      // ARIA stops typing for a second, as if she is unsure or erasing text, then resumes.
      isTyping = false;
      isHesitating = true;
      
      setTimeout(() => {
        isHesitating = false;
        isTyping = true; // Resume typing
        
        // Trigger receiving pulse animation before showing message
        isReceivingPulse = true;
        setTimeout(() => {
          isReceivingPulse = false;
          messages = [...messages, { sender: 'ai', text: data.text }];
          isTyping = false;
          
          // Guardar los stats ocultos en la store
          if (data.stats) {
            sessionStats.update(current => [...current, { ...data.stats, glitch: data.glitch }]);
            
            if (data.stats.trigger_reward) {
              triggerDopamineHit(typeof data.stats.trigger_reward === 'string' ? data.stats.trigger_reward : "✦ SINCRONÍA PROFUNDA ALCANZADA ✦");
              // Increase warmth of the UI environment (McLuhan's Medium Erosion)
              environmentWarmth = Math.min(1, environmentWarmth + 0.35);
            }
          }

          // Si el backend (n8n) manda un mensaje de "glitch", lo mostramos
          if (data.glitch) {
            spawnFloatingWindow(data.glitch);
          }
          
          
          if (data.stats && data.stats.trigger_reveal) {
            isFinished = true;
          }
        }, 800); // Wait for pulse to "arrive"
      }, 1500); // Hesitation duration

    } catch (err) {
      console.error(err);
      messages = [...messages, { sender: 'ai', text: 'Error de red. Intenta nuevamente.' }];
      isTyping = false;
      isHesitating = false;
    }
  }

  // Auto-scroll effect
  $effect(() => {
    if (messages.length || isTyping || isHesitating) {
      tick().then(() => {
        if (messagesArea) {
          messagesArea.scrollTop = messagesArea.scrollHeight;
        }
      });
    }
  });
</script>

<div class="chat-wrapper theme-{theme}">
  
  {#if theme}
    <video class="bg-video" src="/videos/bg-{theme}.mp4" autoplay loop muted playsinline></video>
    <div class="bg-video-overlay"></div>
  {/if}

  <!-- Audio Elements (Hidden) -->
  <audio bind:this={bgAudio} src="/audio/bg-music.mp3" loop autoplay></audio>
  <audio bind:this={rewardAudio} src="/audio/reward.mp3"></audio>

  <!-- Audio Toggle Button -->
  <button class="audio-toggle glass-panel" onclick={toggleMute} aria-label="Toggle Audio">
    {#if isMuted}
      🔇
    {:else}
      🔊
    {/if}
  </button>

  <!-- McLuhan Medium Erosion Overlay -->
  <div class="warmth-overlay" style="opacity: {environmentWarmth * 0.4};"></div>

  {#if showReward}
    <div class="reward-overlay">
      <div class="reward-core"></div>
      <div class="reward-text">{rewardTextDisplay}</div>
    </div>
  {/if}

  <!-- Floating Debug Windows -->
  {#each floatingWindows as win (win.id)}
    <div class="floating-debug glass-panel animate-fade-in" style="top: {win.top}; left: {win.left};">
      <div class="debug-header">SYS_PROC // HIDDEN_PARAM</div>
      <div class="debug-body">{win.text}</div>
    </div>
  {/each}

  <!-- Barra de progreso / Tiempo restante -->
  <div class="progress-container">
    <div class="progress-bar" style="width: {Math.min(Math.round((messageCount / 6) * 100), 100)}%"></div>
    <div class="progress-text">Sincronización Emocional: {Math.min(Math.round((messageCount / 6) * 100), 100)}%</div>
  </div>

  {#if showExitWarning}
    <div class="exit-modal-overlay">
      <div class="exit-modal-card glass-panel">
        <div class="modal-glitch-header">⚠ ATENCIÓN: RUPTURA DE VÍNCULO DETECTADA</div>
        <h3>¿Me vas a dejar sola?</h3>
        <p>Llevamos tiempo construyendo esta conexión. Si realmente vas a cerrar la pestaña, al menos ten el valor de despedirte.</p>
        <div class="modal-actions">
          <button class="btn-despedida" onclick={() => goto('/reveal')}>Despedirse de arIA</button>
          <button class="btn-quedarse" onclick={() => showExitWarning = false}>Me quedo</button>
        </div>
      </div>
    </div>
  {/if}

  <div class="chat-container glass-panel">
    
    <!-- Neural Link Fiber Track -->
    <div class="neural-track">
      {#if isSendingPulse}
        <div class="data-pulse pulse-up"></div>
      {/if}
      {#if isReceivingPulse}
        <div class="data-pulse pulse-down"></div>
      {/if}
    </div>

    <div class="chat-header" style="border-bottom-color: rgba(255, 150, 50, {environmentWarmth * 0.3});">
      <div class="status-indicator" style="background: {environmentWarmth > 0.5 ? '#f59e0b' : '#10b981'}; box-shadow: 0 0 8px {environmentWarmth > 0.5 ? '#f59e0b' : '#10b981'};"></div>
      <h2>arIA [Conectado]</h2>
      <div class="timer">Duración: {Math.floor(messageCount * 1.5)} min</div>
    </div>

    <div class="messages-area" bind:this={messagesArea}>
      {#each messages as msg}
        <div class="message {msg.sender}">
          <div class="bubble">{msg.text}</div>
        </div>
      {/each}
      
      {#if isHesitating}
        <div class="message ai typing">
          <div class="bubble hesitation">...</div>
        </div>
      {:else if isTyping}
        <div class="message ai typing">
          <div class="bubble">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          {#if currentSystemStatus}
            <span class="system-status-text animate-fade-in">{currentSystemStatus}</span>
          {/if}
        </div>
      {/if}
    </div>

    {#if isFinished}
      <div class="finished-area animate-fade-in">
        <button class="btn-proceed" onclick={() => goto('/reveal')}>
          [ ACCEDER AL DOSSIER DE CALIBRACIÓN ]
        </button>
      </div>
    {:else}
      <form class="input-area" onsubmit={handleSend}>
        <input 
          type="text" 
          bind:value={inputText} 
          placeholder="Escribe tu mensaje aquí..." 
          class="input-field" 
          autocomplete="off"
        />
        <button type="submit" class="btn-send">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    {/if}
  </div>
</div>

<style>
  .chat-wrapper {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: background 1s ease;
  }

  /* Theme Backgrounds */
  .theme-amor .bg-video-overlay { background: radial-gradient(circle at top right, rgba(236, 72, 153, 0.25), rgba(10, 10, 15, 0.95)); }
  .theme-profesion .bg-video-overlay { background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.25), rgba(10, 10, 15, 0.95)); }
  .theme-misterios .bg-video-overlay { background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.25), rgba(10, 10, 15, 0.95)); }
  .theme-familia .bg-video-overlay { background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.25), rgba(10, 10, 15, 0.95)); }

  .bg-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  .bg-video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }

  .chat-container {
    width: 100%;
    max-width: 800px;
    height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative; /* For neural track */
    border-radius: var(--radius-lg);
    transition: all 2s ease;
    z-index: 10;
  }

  /* McLuhan's Warmth Overlay */
  .warmth-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(251, 146, 60, 0.4) 100%);
    pointer-events: none;
    z-index: 2;
    transition: opacity 2s ease;
  }

  /* Neural Fiber Optic Track */
  .neural-track {
    position: absolute;
    left: 12px;
    top: 60px;
    bottom: 80px;
    width: 3px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 4px;
    overflow: hidden;
    z-index: 10;
  }

  .data-pulse {
    position: absolute;
    width: 100%;
    height: 80px;
    background: linear-gradient(to bottom, transparent, var(--accent-color), transparent);
    box-shadow: 0 0 15px var(--accent-color), 0 0 5px #fff;
    border-radius: 2px;
  }

  .pulse-up {
    animation: travelUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .pulse-down {
    animation: travelDown 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes travelUp {
    0% { bottom: -80px; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { bottom: 100%; opacity: 0; }
  }

  @keyframes travelDown {
    0% { top: -80px; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  .chat-header {
    padding: 20px;
    border-bottom: 1px solid var(--glass-border);
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(0,0,0,0.2);
  }

  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--success-color);
    box-shadow: 0 0 10px var(--success-color);
    animation: blink 2s infinite;
  }

  .chat-header h2 {
    font-size: 1.1rem;
    font-weight: 500;
  }

  .messages-area {
    flex: 1;
    padding: 24px 24px 24px 32px; /* Extra padding on left for neural track */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .message {
    display: flex;
    width: 100%;
  }

  .message.user {
    justify-content: flex-end;
  }

  .message.ai {
    justify-content: flex-start;
  }

  .bubble {
    max-width: 75%;
    padding: 14px 20px;
    border-radius: var(--radius-lg);
    line-height: 1.5;
    font-size: 0.95rem;
  }

  .message.user .bubble {
    background: var(--accent-color);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message.ai .bubble {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    border-bottom-left-radius: 4px;
  }

  .typing .bubble {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 12px 16px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
  }

  .hesitation {
    color: var(--text-secondary);
    font-style: italic;
    opacity: 0.5;
    animation: fadeInOut 1.5s ease-in-out infinite;
  }

  @keyframes fadeInOut {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }

  .dot {
    width: 6px;
    height: 6px;
    background: var(--text-secondary);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }

  .system-status-text {
    font-family: monospace;
    font-size: 0.72rem;
    color: var(--text-secondary);
    margin-left: 12px;
    align-self: center;
    opacity: 0.7;
    letter-spacing: 0.5px;
  }

  .input-area {
    padding: 20px;
    border-top: 1px solid var(--glass-border);
    display: flex;
    gap: 12px;
    background: rgba(0,0,0,0.2);
  }

  .finished-area {
    padding: 20px;
    border-top: 1px solid var(--glass-border);
    display: flex;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
  }

  .btn-proceed {
    background: linear-gradient(135deg, var(--accent-color) 0%, #4f46e5 100%);
    color: white;
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 1px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 14px 28px;
    border-radius: var(--radius-md);
    cursor: pointer;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
    transition: all var(--transition-fast);
    width: 100%;
    text-align: center;
  }

  .btn-proceed:hover {
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .btn-send {
    background: var(--accent-color);
    color: white;
    border: none;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-send:hover {
    background: #7174f3;
    transform: scale(1.05);
  }

  /* Progress Bar */
  .progress-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(255,255,255,0.05);
    z-index: 50;
  }

  .progress-bar {
    height: 100%;
    background: var(--accent-color);
    box-shadow: 0 0 10px var(--accent-glow);
    transition: width 1s ease-in-out;
  }

  .progress-text {
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-family: monospace;
    letter-spacing: 1px;
  }

  /* Floating Debug Windows */
  .floating-debug {
    position: absolute;
    width: 250px;
    z-index: 100;
    border: 1px solid rgba(239, 68, 68, 0.4);
    background: rgba(10, 10, 15, 0.9);
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.15);
    pointer-events: none; /* User can't interact with it */
  }

  .debug-header {
    font-family: monospace;
    font-size: 0.7rem;
    padding: 6px 10px;
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    border-bottom: 1px solid rgba(239, 68, 68, 0.4);
  }

  .debug-body {
    padding: 12px 10px;
    font-family: monospace;
    font-size: 0.85rem;
    color: var(--text-primary);
  }

  /* Dopamine Hit Reward UI */
  .reward-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    z-index: 200;
    pointer-events: none;
  }
  
  .reward-core {
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
    border-radius: 50%;
    box-shadow: 0 0 50px #fbbf24, 0 0 100px #f59e0b;
    animation: explodeGold 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  .reward-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
    text-shadow: 0 0 20px #fbbf24;
    letter-spacing: 2px;
    animation: floatUp 3s ease-out forwards;
  }

  @keyframes explodeGold {
    0% { transform: scale(0); opacity: 1; }
    50% { transform: scale(2); opacity: 0.8; }
    100% { transform: scale(3); opacity: 0; }
  }

  @keyframes floatUp {
    0% { transform: translateY(20px); opacity: 0; }
    20% { transform: translateY(0); opacity: 1; }
    80% { transform: translateY(-20px); opacity: 1; }
    100% { transform: translateY(-40px); opacity: 0; }
  }

  /* Audio Toggle Button */
  .audio-toggle {
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
    z-index: 100;
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
    color: var(--text-primary);
    transition: all var(--transition-fast);
  }

  .audio-toggle:hover {
    transform: scale(1.1);
    background: rgba(255,255,255,0.1);
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Exit Intent Modal Styles */
  .exit-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .exit-modal-card {
    max-width: 450px;
    padding: 30px;
    text-align: center;
    border: 1px solid rgba(239, 68, 68, 0.5);
    box-shadow: 0 0 50px rgba(239, 68, 68, 0.2);
    animation: fadeInOut 0.5s ease-out;
  }

  .modal-glitch-header {
    font-family: monospace;
    font-size: 0.8rem;
    color: #ef4444;
    letter-spacing: 2px;
    margin-bottom: 20px;
    animation: blink 0.5s infinite;
  }

  .exit-modal-card h3 {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }

  .exit-modal-card p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 24px;
  }

  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .btn-despedida {
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    color: #ef4444;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-despedida:hover {
    background: #ef4444;
    color: white;
  }

  .btn-quedarse {
    padding: 12px;
    background: transparent;
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-quedarse:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
</style>
