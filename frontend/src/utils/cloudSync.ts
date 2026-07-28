// Cross-device Cloud Sync helper for Lakshmi Dental Care
export async function syncSaveToCloud(key: string, data: any) {
  // Save to LocalStorage instantly for local responsiveness
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage save failed:', e);
  }

  // Push to serverless cloud endpoint for cross-device sync
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data })
    });
  } catch (e) {
    console.error('Cloud API sync POST failed:', e);
  }
}

export async function syncLoadFromCloud(key: string, defaultFallback: any) {
  // Try loading from Vercel Cloud Sync API first for cross-device updates
  try {
    const res = await fetch('/api/sync');
    if (res.ok) {
      const cloudState = await res.json();
      if (cloudState && cloudState[key]) {
        localStorage.setItem(key, JSON.stringify(cloudState[key]));
        return cloudState[key];
      }
    }
  } catch (e) {
    console.error('Cloud API sync GET failed:', e);
  }

  // LocalStorage fallback
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('LocalStorage load failed:', e);
  }

  return defaultFallback;
}
