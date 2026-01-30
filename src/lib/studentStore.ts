import { Student } from "@/types/student";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "ises_students";

// Helper pour compresser les images (réduire la qualité)
const compressImage = (base64: string, maxWidth = 300, quality = 0.6): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64 || !base64.startsWith('data:image')) {
      resolve(base64);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
};

// Helper pour vérifier l'espace localStorage disponible
const getStorageUsage = (): { used: number; available: number } => {
  let used = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage.getItem(key)?.length || 0;
    }
  }
  // Estimation de la limite (généralement 5MB)
  const limit = 5 * 1024 * 1024;
  return { used, available: limit - used };
};

export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getStudentById = (id: string): Student | undefined => {
  const students = getStudents();
  return students.find((s) => s.id === id);
};

export const getStudentByQRCode = (qrCodeData: string): Student | undefined => {
  const students = getStudents();
  return students.find((s) => s.qrCodeData === qrCodeData || s.id === qrCodeData);
};

export const addStudent = async (studentData: Omit<Student, "id" | "qrCodeData" | "dateCreation">): Promise<Student> => {
  const students = getStudents();
  const id = uuidv4();
  
  // Compresser la photo si elle existe
  let compressedPhoto = studentData.photo;
  if (studentData.photo) {
    compressedPhoto = await compressImage(studentData.photo, 250, 0.5);
  }
  
  const newStudent: Student = {
    ...studentData,
    photo: compressedPhoto,
    id,
    qrCodeData: id,
    dateCreation: new Date().toISOString(),
  };
  
  students.push(newStudent);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Nettoyer les anciens étudiants pour libérer de l'espace
      const { available } = getStorageUsage();
      console.warn(`Espace disponible: ${Math.round(available / 1024)}KB`);
      
      throw new Error("QUOTA_EXCEEDED: L'espace de stockage est plein. Veuillez supprimer des étudiants existants ou réduire la taille des photos.");
    }
    throw error;
  }
  
  return newStudent;
};

export const deleteStudent = (id: string): void => {
  const students = getStudents();
  const filtered = students.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const updateStudent = async (id: string, updates: Partial<Student>): Promise<Student | undefined> => {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === id);
  
  if (index === -1) return undefined;
  
  // Compresser la nouvelle photo si elle existe
  if (updates.photo) {
    updates.photo = await compressImage(updates.photo, 250, 0.5);
  }
  
  students[index] = { ...students[index], ...updates };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error("QUOTA_EXCEEDED: L'espace de stockage est plein. Veuillez supprimer des étudiants existants.");
    }
    throw error;
  }
  
  return students[index];
};

export const clearAllStudents = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getStorageInfo = (): { studentCount: number; usedKB: number } => {
  const students = getStudents();
  const data = localStorage.getItem(STORAGE_KEY) || '';
  return {
    studentCount: students.length,
    usedKB: Math.round(data.length / 1024)
  };
};
