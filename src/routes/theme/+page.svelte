<script lang="ts">
  import { goto } from '$app/navigation';
  import { selectedTheme, userProfile } from '$lib/store';
  import { onMount } from 'svelte';

  let name = $state('');
  
  onMount(() => {
    userProfile.subscribe(profile => {
      name = profile.name;
    });
  });

  const themes = [
    { id: 'esencia', title: 'Dudas y Esencia', icon: '🧩', color: '#f59e0b', desc: 'Preguntas difíciles sobre quién eres y qué buscas.' },
    { id: 'amor', title: 'Amor y Relaciones', icon: '❤️', color: '#ec4899', desc: 'Explora los laberintos del corazón.' },
    { id: 'profesion', title: 'Vida Profesional', icon: '💼', color: '#3b82f6', desc: 'Metas, frustraciones y el camino al éxito.' },
    { id: 'misterios', title: 'El mundo y sus misterios', icon: '🌌', color: '#8b5cf6', desc: 'Preguntas sin respuesta y el universo.' },
    { id: 'familia', title: 'Familia y Amigos', icon: '🤝', color: '#10b981', desc: 'Nuestros lazos más cercanos.' }
  ];

  let selectingId: string | null = $state(null);

  function selectTheme(id: string) {
    selectingId = id;
    selectedTheme.set(id);
    
    // Simulate analyzing time before redirect
    setTimeout(() => {
      goto('/chat');
    }, 1200);
  }
</script>

<div class="theme-container animate-fade-in">
  <div class="header-section">
    <h1>Hola, {name || 'Viajero'}</h1>
    <p>¿Sobre qué frecuencia temática te gustaría sintonizar hoy?</p>
  </div>

  <div class="warning-box glass-panel">
    <span class="warning-icon">⚠️</span>
    <p><strong>Aviso Importante:</strong> Esta experiencia es un simulacro interactivo. Por favor, <strong>no compartas información sensible</strong>, contraseñas o datos personales reales durante la conversación.</p>
  </div>

  <div class="themes-grid">
    {#each themes as theme}
      <button 
        class="theme-card glass-panel {selectingId === theme.id ? 'selected' : ''}"
        style="--theme-color: {theme.color}"
        onclick={() => selectTheme(theme.id)}
        disabled={selectingId !== null}
      >
        <div class="icon-wrapper">{theme.icon}</div>
        <h3>{theme.title}</h3>
        <p>{theme.desc}</p>
        
        {#if selectingId === theme.id}
          <div class="loading-overlay">
            <div class="spinner"></div>
            <span>Calibrando...</span>
          </div>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .theme-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .header-section {
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 12px;
    background: linear-gradient(to right, var(--text-primary), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .header-section p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .warning-box {
    display: flex;
    gap: 16px;
    padding: 16px 24px;
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.05);
    align-items: center;
  }

  .warning-icon {
    font-size: 1.5rem;
  }

  .warning-box p {
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  .themes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  }

  .theme-card {
    position: relative;
    padding: 32px 24px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 12px;
    cursor: pointer;
    transition: all var(--transition-smooth);
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
    overflow: hidden;
  }

  .theme-card:hover:not(:disabled) {
    transform: translateY(-5px);
    border-color: var(--theme-color);
    box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.02);
  }

  .theme-card:hover:not(:disabled) .icon-wrapper {
    transform: scale(1.1);
  }

  .icon-wrapper {
    font-size: 2.5rem;
    transition: transform var(--transition-fast);
  }

  h3 {
    font-size: 1.2rem;
    color: var(--text-primary);
  }

  .theme-card p {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .selected {
    border-color: var(--theme-color);
    box-shadow: 0 0 40px rgba(0,0,0,0.5);
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--glass-bg);
    backdrop-filter: blur(4px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    color: var(--theme-color);
    font-weight: 500;
  }

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid var(--glass-border);
    border-top-color: var(--theme-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
