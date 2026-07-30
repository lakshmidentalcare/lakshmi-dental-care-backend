// Cross-device Cloud Sync helper for Lakshmi Dental Care
export async function syncSaveToCloud(key: string, data: any) {
  // Save to LocalStorage instantly for local responsiveness
  try {
    localStorage.setItem(key, JSON.stringify(data));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ldc_settings_updated'));
    }
  } catch (e) {}

  // Push to cloud endpoint
  try {
    const res = await fetch('/api/cloud-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data })
    });
    if (!res.ok) {
      // Fallback endpoint if Vercel WAF blocks /api/cloud-data
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data })
      }).catch(() => {});
    }
  } catch (e) {}
}

export async function syncLoadFromCloud(key: string, defaultFallback: any) {
  // Try loading from Cloud Data API first
  try {
    const res = await fetch('/api/cloud-data');
    if (res.ok) {
      const cloudState = await res.json();
      if (cloudState && cloudState[key] !== undefined) {
        try {
          localStorage.setItem(key, JSON.stringify(cloudState[key]));
        } catch (e) {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('ldc_settings_updated'));
        }
        return cloudState[key];
      }
    }
  } catch (e) {}

  // Fallback to /api/sync if /api/cloud-data fails
  try {
    const res = await fetch('/api/sync');
    if (res.ok) {
      const cloudState = await res.json();
      if (cloudState && cloudState[key] !== undefined) {
        try {
          localStorage.setItem(key, JSON.stringify(cloudState[key]));
        } catch (e) {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('ldc_settings_updated'));
        }
        return cloudState[key];
      }
    }
  } catch (e) {}

  // LocalStorage fallback
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return defaultFallback;
}
