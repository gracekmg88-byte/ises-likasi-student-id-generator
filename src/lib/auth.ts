const ADMIN_KEY = "ises_admin_auth";

// Credentials admin par défaut (à remplacer par une vraie auth en production)
const DEFAULT_ADMIN = {
  username: "gracekot20@gmail.com",
  password: "GRAkey245",
};

export const login = (username: string, password: string): boolean => {
  if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify({ authenticated: true, timestamp: Date.now() }));
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(ADMIN_KEY);
};

export const isAuthenticated = (): boolean => {
  const data = localStorage.getItem(ADMIN_KEY);
  if (!data) return false;
  
  try {
    const auth = JSON.parse(data);
    // Session valide pendant 24h
    const isValid = auth.authenticated && (Date.now() - auth.timestamp) < 24 * 60 * 60 * 1000;
    return isValid;
  } catch {
    return false;
  }
};
