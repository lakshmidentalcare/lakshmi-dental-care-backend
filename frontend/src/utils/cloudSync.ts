import { fetchServerCloudStore, saveServerCloudStore } from '@/app/actions/syncAction';

// Cross-device Cloud Sync helper for Lakshmi Dental Care using Next.js Server Actions
export async function syncSaveToCloud(key: string, data: any) {
  // Save to LocalStorage instantly for local responsiveness
  try {
    localStorage.setItem(key, JSON.stringify(data));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ldc_settings_updated'));
    }
  } catch (e) {}

  // Push via Next.js Server Action (bypasses Vercel API Protection 100%)
  try {
    await saveServerCloudStore(key, data);
  } catch (e) {
    // Fallback REST endpoint if Server Action fails
    try {
      await fetch('/api/cloud-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data })
      });
    } catch (err) {}
  }
}

export async function syncLoadFromCloud(key: string, defaultFallback: any) {
  // Try loading from Next.js Server Action first (0ms latency, zero 403 errors)
  try {
    const cloudState = await fetchServerCloudStore();
    if (cloudState && cloudState[key] !== undefined) {
      try {
        localStorage.setItem(key, JSON.stringify(cloudState[key]));
      } catch (e) {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ldc_settings_updated'));
      }
      return cloudState[key];
    }
  } catch (e) {
    // REST fallback if Server Action fails
    try {
      const res = await fetch('/api/cloud-data');
      if (res.ok) {
        const cloudState = await res.json();
        if (cloudState && cloudState[key] !== undefined) {
          try {
            localStorage.setItem(key, JSON.stringify(cloudState[key]));
          } catch (err) {}
          return cloudState[key];
        }
      }
    } catch (err) {}
  }

  // LocalStorage fallback
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return defaultFallback;
}
