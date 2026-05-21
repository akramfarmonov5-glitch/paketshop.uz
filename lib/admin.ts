import { supabase } from './supabaseClient';

export async function isAdminUser(userId?: string | null): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Admin role lookup failed:', error.message);
    return false;
  }

  return Boolean(data);
}

export const playNotificationSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playBeep = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gainNode.gain.setValueAtTime(0.15, start);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    playBeep(523.25, audioCtx.currentTime, 0.15); // C5
    playBeep(659.25, audioCtx.currentTime + 0.1, 0.25); // E5
  } catch (e) {
    console.error("Failed to play sound:", e);
  }
};
