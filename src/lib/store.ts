import { writable } from 'svelte/store';

export const userProfile = writable({
  name: '',
  email: '',
});

export const selectedTheme = writable('');
export const sessionStats = writable<any[]>([]);
export const isRevealed = writable(false);
export const chatMessages = writable<any[]>([]);
