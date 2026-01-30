import { Admin } from "@/types/student";
import { v4 as uuidv4 } from "uuid";

const ADMIN_STORAGE_KEY = "ises_admins";
const AUTH_KEY = "ises_admin_auth";

// Admin par défaut
const DEFAULT_ADMIN: Admin = {
  id: uuidv4(),
  email: "gracekot20@gmail.com",
  password: "GRAkey245",
  nom: "Administrateur Principal",
  dateCreation: new Date().toISOString(),
};

const initializeAdmins = (): void => {
  const existing = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]));
  }
};

// Initialiser au chargement
initializeAdmins();

export const getAdmins = (): Admin[] => {
  initializeAdmins();
  const data = localStorage.getItem(ADMIN_STORAGE_KEY);
  return data ? JSON.parse(data) : [DEFAULT_ADMIN];
};

export const getAdminById = (id: string): Admin | undefined => {
  return getAdmins().find((a) => a.id === id);
};

export const getAdminByEmail = (email: string): Admin | undefined => {
  return getAdmins().find((a) => a.email.toLowerCase() === email.toLowerCase());
};

export const addAdmin = (adminData: Omit<Admin, "id" | "dateCreation">): Admin => {
  const admins = getAdmins();
  
  // Vérifier si l'email existe déjà
  if (admins.some((a) => a.email.toLowerCase() === adminData.email.toLowerCase())) {
    throw new Error("Un administrateur avec cet email existe déjà");
  }
  
  const newAdmin: Admin = {
    ...adminData,
    id: uuidv4(),
    dateCreation: new Date().toISOString(),
  };
  
  admins.push(newAdmin);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
  
  return newAdmin;
};

export const updateAdmin = (id: string, updates: Partial<Admin>): Admin | undefined => {
  const admins = getAdmins();
  const index = admins.findIndex((a) => a.id === id);
  
  if (index === -1) return undefined;
  
  // Vérifier si le nouvel email existe déjà (si modifié)
  if (updates.email) {
    const emailExists = admins.some(
      (a, i) => i !== index && a.email.toLowerCase() === updates.email!.toLowerCase()
    );
    if (emailExists) {
      throw new Error("Un administrateur avec cet email existe déjà");
    }
  }
  
  admins[index] = { ...admins[index], ...updates };
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
  
  return admins[index];
};

export const updateAdminPhoto = (id: string, photoProfile: string): Admin | undefined => {
  return updateAdmin(id, { photoProfile });
};

export const deleteAdmin = (id: string): boolean => {
  const admins = getAdmins();
  
  // Ne pas permettre de supprimer le dernier admin
  if (admins.length <= 1) {
    throw new Error("Impossible de supprimer le dernier administrateur");
  }
  
  const filtered = admins.filter((a) => a.id !== id);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(filtered));
  
  return true;
};

export const changePassword = (adminId: string, currentPassword: string, newPassword: string): boolean => {
  const admins = getAdmins();
  const admin = admins.find((a) => a.id === adminId);
  
  if (!admin) {
    throw new Error("Administrateur non trouvé");
  }
  
  if (admin.password !== currentPassword) {
    throw new Error("Mot de passe actuel incorrect");
  }
  
  if (newPassword.length < 6) {
    throw new Error("Le nouveau mot de passe doit contenir au moins 6 caractères");
  }
  
  admin.password = newPassword;
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
  
  return true;
};

export const login = (email: string, password: string): Admin | null => {
  const admin = getAdminByEmail(email);
  
  if (admin && admin.password === password) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ 
      adminId: admin.id, 
      authenticated: true, 
      timestamp: Date.now() 
    }));
    return admin;
  }
  
  return null;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  const data = localStorage.getItem(AUTH_KEY);
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

export const getCurrentAdmin = (): Admin | undefined => {
  const data = localStorage.getItem(AUTH_KEY);
  if (!data) return undefined;
  
  try {
    const auth = JSON.parse(data);
    if (auth.adminId) {
      return getAdminById(auth.adminId);
    }
  } catch {
    return undefined;
  }
  
  return undefined;
};
