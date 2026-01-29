import { Institution } from "@/types/student";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "ises_institutions";

// Institution par défaut
const DEFAULT_INSTITUTION: Institution = {
  id: "default",
  nom: "Institut Supérieur des Études Sociales (ISES-LIKASI)",
  tutelle: "République Démocratique du Congo – Enseignement Supérieur et Universitaire",
  mentionSignature: "Directeur Général",
  dateCreation: new Date().toISOString(),
};

const initializeInstitutions = (): void => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([DEFAULT_INSTITUTION]));
  }
};

// Initialiser au chargement
initializeInstitutions();

export const getInstitutions = (): Institution[] => {
  initializeInstitutions();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [DEFAULT_INSTITUTION];
};

export const getInstitutionById = (id: string): Institution | undefined => {
  return getInstitutions().find((i) => i.id === id);
};

export const getDefaultInstitution = (): Institution => {
  const institutions = getInstitutions();
  return institutions[0] || DEFAULT_INSTITUTION;
};

export const addInstitution = (data: Omit<Institution, "id" | "dateCreation">): Institution => {
  const institutions = getInstitutions();
  
  const newInstitution: Institution = {
    ...data,
    id: uuidv4(),
    dateCreation: new Date().toISOString(),
  };
  
  institutions.push(newInstitution);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(institutions));
  
  return newInstitution;
};

export const updateInstitution = (id: string, updates: Partial<Institution>): Institution | undefined => {
  const institutions = getInstitutions();
  const index = institutions.findIndex((i) => i.id === id);
  
  if (index === -1) return undefined;
  
  institutions[index] = { ...institutions[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(institutions));
  
  return institutions[index];
};

export const deleteInstitution = (id: string): boolean => {
  const institutions = getInstitutions();
  
  // Ne pas permettre de supprimer la dernière institution
  if (institutions.length <= 1) {
    throw new Error("Impossible de supprimer la dernière institution");
  }
  
  const filtered = institutions.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  
  return true;
};
