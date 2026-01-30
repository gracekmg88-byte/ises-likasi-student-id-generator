import { AppUser } from "@/types/student";
import { v4 as uuidv4 } from "uuid";

const USER_STORAGE_KEY = "kmg_users";
const USER_AUTH_KEY = "kmg_user_auth";

// Essai gratuit: 3 cartes maximum
const FREE_TRIAL_CARDS = 3;

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
  const users = data ? JSON.parse(data) : [];
  
  // Migration des anciens utilisateurs
  return users.map((user: any) => ({
    ...user,
    cardsGenerated: user.cardsGenerated ?? 0,
    cardsQuota: user.cardsQuota ?? 0,
    freeTrialUsed: user.freeTrialUsed ?? 0,
  }));
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
  
  const newUser: AppUser = {
    id: uuidv4(),
    email: userData.email.toLowerCase(),
    password: userData.password,
    nom: userData.nom,
    isPremium: false,
    dateCreation: new Date().toISOString(),
    cardsGenerated: 0,
    cardsQuota: 0,
    freeTrialUsed: 0,
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

// Activer le premium avec un quota de cartes
export const setUserPremium = (userId: string, cardsQuota: number): AppUser | undefined => {
  const user = getUserById(userId);
  if (!user) return undefined;
  
  return updateUser(userId, { 
    isPremium: cardsQuota > 0, 
    cardsQuota: user.cardsQuota + cardsQuota,
    dateActivation: cardsQuota > 0 ? new Date().toISOString() : user.dateActivation 
  });
};

// Révoquer le premium
export const revokePremium = (userId: string): AppUser | undefined => {
  return updateUser(userId, { 
    isPremium: false,
    cardsQuota: 0,
    cardsGenerated: 0
  });
};

// Vérifier si l'utilisateur peut générer une carte
export const canGenerateCard = (user: AppUser): boolean => {
  if (user.isPremium) {
    // Premium: vérifier le quota
    return user.cardsGenerated < user.cardsQuota;
  } else {
    // Essai gratuit: max 3 cartes
    return user.freeTrialUsed < FREE_TRIAL_CARDS;
  }
};

// Obtenir le nombre de cartes restantes
export const getRemainingCards = (user: AppUser): number => {
  if (user.isPremium) {
    return Math.max(0, user.cardsQuota - user.cardsGenerated);
  } else {
    return Math.max(0, FREE_TRIAL_CARDS - user.freeTrialUsed);
  }
};

// Décrémenter le quota après génération
export const decrementCardQuota = (userId: string): AppUser | undefined => {
  const user = getUserById(userId);
  if (!user) return undefined;
  
  if (user.isPremium) {
    return updateUser(userId, { 
      cardsGenerated: user.cardsGenerated + 1 
    });
  } else {
    return updateUser(userId, { 
      freeTrialUsed: user.freeTrialUsed + 1 
    });
  }
};

// Vérifier si l'essai gratuit est terminé
export const isFreeTrialExpired = (user: AppUser): boolean => {
  if (user.isPremium) return false;
  return user.freeTrialUsed >= FREE_TRIAL_CARDS;
};

// Vérifier si l'utilisateur est actif (peut utiliser l'app)
export const isUserActive = (user: AppUser): boolean => {
  return user.isPremium || !isFreeTrialExpired(user);
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

export const getFreeTrialLimit = (): number => FREE_TRIAL_CARDS;
