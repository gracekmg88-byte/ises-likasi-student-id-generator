import { AppUser } from "@/types/student";
import { v4 as uuidv4 } from "uuid";

const USER_STORAGE_KEY = "kmg_users";
const USER_AUTH_KEY = "kmg_user_auth";

// Trial period: 1 day
const TRIAL_DAYS = 1;

const initializeUsers = (): void => {
  const existing = localStorage.getItem(USER_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify([]));
  }
};

initializeUsers();

export const getUsers = (): AppUser[] => {
  initializeUsers();
  const data = localStorage.getItem(USER_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getUserById = (id: string): AppUser | undefined => {
  return getUsers().find((u) => u.id === id);
};

export const getUserByEmail = (email: string): AppUser | undefined => {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
};

export const registerUser = (userData: { email: string; password: string; nom: string }): AppUser => {
  const users = getUsers();
  
  if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error("Un utilisateur avec cet email existe déjà");
  }
  
  if (userData.password.length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caractères");
  }
  
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
  
  const newUser: AppUser = {
    id: uuidv4(),
    email: userData.email.toLowerCase(),
    password: userData.password,
    nom: userData.nom,
    isPremium: false,
    dateCreation: new Date().toISOString(),
    trialEndDate: trialEnd.toISOString(),
  };
  
  users.push(newUser);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  
  return newUser;
};

export const updateUser = (id: string, updates: Partial<AppUser>): AppUser | undefined => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  
  if (index === -1) return undefined;
  
  users[index] = { ...users[index], ...updates };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  
  return users[index];
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

export const setUserPremium = (userId: string, isPremium: boolean): AppUser | undefined => {
  return updateUser(userId, { 
    isPremium, 
    dateActivation: isPremium ? new Date().toISOString() : undefined 
  });
};

export const isTrialActive = (user: AppUser): boolean => {
  if (user.isPremium) return true;
  const trialEnd = new Date(user.trialEndDate);
  return new Date() <= trialEnd;
};

export const isUserActive = (user: AppUser): boolean => {
  return user.isPremium || isTrialActive(user);
};

export const loginUser = (email: string, password: string): AppUser | null => {
  const user = getUserByEmail(email);
  
  if (user && user.password === password) {
    localStorage.setItem(USER_AUTH_KEY, JSON.stringify({ 
      userId: user.id, 
      authenticated: true, 
      timestamp: Date.now() 
    }));
    return user;
  }
  
  return null;
};

export const logoutUser = (): void => {
  localStorage.removeItem(USER_AUTH_KEY);
};

export const isUserAuthenticated = (): boolean => {
  const data = localStorage.getItem(USER_AUTH_KEY);
  if (!data) return false;
  
  try {
    const auth = JSON.parse(data);
    const isValid = auth.authenticated && (Date.now() - auth.timestamp) < 24 * 60 * 60 * 1000;
    return isValid;
  } catch {
    return false;
  }
};

export const getCurrentUser = (): AppUser | undefined => {
  const data = localStorage.getItem(USER_AUTH_KEY);
  if (!data) return undefined;
  
  try {
    const auth = JSON.parse(data);
    if (auth.userId) {
      return getUserById(auth.userId);
    }
  } catch {
    return undefined;
  }
  
  return undefined;
};

export const getRemainingTrialDays = (user: AppUser): number => {
  if (user.isPremium) return -1;
  const trialEnd = new Date(user.trialEndDate);
  const now = new Date();
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
