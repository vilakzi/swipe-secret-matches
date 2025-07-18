
export const clearAppCache = async () => {
  try {
    console.log('🧹 Starting cache clear...');
    
    // Clear localStorage
    localStorage.clear();
    console.log('✅ localStorage cleared');
    
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
    
    // Clear IndexedDB if available
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            if (db.name) {
              const deleteReq = indexedDB.deleteDatabase(db.name);
              return new Promise((resolve) => {
                deleteReq.onsuccess = () => resolve(true);
                deleteReq.onerror = () => resolve(false);
              });
            }
          })
        );
        console.log('✅ IndexedDB cleared');
      } catch (error) {
        console.warn('⚠️ IndexedDB clear failed:', error);
      }
    }
    
    // Clear service worker cache
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('✅ Service worker cache cleared');
      } catch (error) {
        console.warn('⚠️ Service worker cache clear failed:', error);
      }
    }
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
        console.log('✅ Service worker unregistered');
      } catch (error) {
        console.warn('⚠️ Service worker unregister failed:', error);
      }
    }
    
    console.log('🎉 Cache clear completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Cache clear failed:', error);
    return false;
  }
};

export const clearUserData = () => {
  // Clear specific user-related data
  const keysToRemove = [
    'supabase.auth.token',
    'sb-galrcqwogqqdsqdzfrrd-auth-token',
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Clear offline storage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('offline_')) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ User data cleared');
};
