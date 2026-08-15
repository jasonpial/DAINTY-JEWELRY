import { useState, useEffect } from 'react';

// Parser to translate hash to route details
export function parseHash(hash) {
  if (!hash || hash === '#' || hash === '#/') {
    return { page: 'home', params: {} };
  }
  
  // Strip starting # and /
  const cleanHash = hash.replace(/^#\/?/, '');
  const [path, queryStr] = cleanHash.split('?');
  
  const params = {};
  if (queryStr) {
    const pairs = queryStr.split('&');
    pairs.forEach(pair => {
      const [key, val] = pair.split('=');
      if (key) {
        params[key] = decodeURIComponent(val || '');
      }
    });
  }
  
  return { page: path, params };
}

// Navigates programmatically by updating the window hash
export function navigateTo(page, params = {}) {
  let hashStr = `#/${page}`;
  
  const queryParts = [];
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      queryParts.push(`${key}=${encodeURIComponent(val)}`);
    }
  });
  
  if (queryParts.length > 0) {
    hashStr += `?${queryParts.join('&')}`;
  }
  
  window.location.hash = hashStr;
}

// React Hook to subscribe to hash changes
export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return route;
}
