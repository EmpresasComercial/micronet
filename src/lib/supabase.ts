/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Custom fetch to handle connectivity and timeouts globally
const customFetch = async (url: string, options: any = {}) => {
  // 1. Connectivity Check
  if (!navigator.onLine) {
    window.dispatchEvent(new CustomEvent('app:offline'));
    return Promise.reject(new Error('Offline'));
  }

  // 2. Global Loading Start
  window.dispatchEvent(new CustomEvent('app:loading-start'));

  // 3. Timeout Implementation (20 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    window.dispatchEvent(new CustomEvent('app:loading-end'));
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    window.dispatchEvent(new CustomEvent('app:loading-end'));
    if (error.name === 'AbortError') {
      window.dispatchEvent(new CustomEvent('app:timeout'));
      return Promise.reject(new Error('Request Timeout'));
    }
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  }
});
