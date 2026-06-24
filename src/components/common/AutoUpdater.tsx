import { useEffect } from 'react';
import pkg from '../../../package.json';

export const AutoUpdater = () => {
  useEffect(() => {
    // Check for new version every 5 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/version.json?t=${new Date().getTime()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.version && data.version !== pkg.version) {
            console.log(`Update detected! Local: ${pkg.version}, Remote: ${data.version}. Reloading...`);
            window.location.reload();
          }
        }
      } catch (err) {
        // Silently ignore fetch errors (e.g., offline)
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
};
