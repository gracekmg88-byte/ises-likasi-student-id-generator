import { Student } from "@/types/student";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "ises_students";

// Compression agressive des images pour économiser l'espace
const compressImage = (base64: string, maxWidth = 150, quality = 0.3): Promise<string> => {
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
const getStorageUsage = (): { used: number; available: number; percentage: number } => {
  let used = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage.getItem(key)?.length || 0;
    }
  }
  const limit = 5 * 1024 * 1024; // 5MB
  return { 
    used, 
    available: limit - used,
    percentage: Math.round((used / limit) * 100)
  };
};

// Nettoyer les anciennes données pour libérer de l'espace
const cleanupOldData = (): void => {
  // Supprimer les clés orphelines ou temporaires
  const keysToCheck = ['temp_', 'cache_', 'draft_'];
  for (const key in localStorage) {
    if (keysToCheck.some(prefix => key.startsWith(prefix))) {
      localStorage.removeItem(key);
    }
  }
};

// Recompresser toutes les photos existantes pour libérer de l'espace
export const optimizeStorage = async (): Promise<{ freed: number; newSize: number }> => {
  const students = getStudents();
  const oldSize = localStorage.getItem(STORAGE_KEY)?.length || 0;
  
  // Recompresser toutes les photos avec une compression plus agressive
  const optimizedStudents = await Promise.all(
    students.map(async (student) => {
      if (student.photo && student.photo.length > 5000) {
        const compressed = await compressImage(student.photo, 120, 0.25);
        return { ...student, photo: compressed };
      }
      return student;
    })
  );
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(optimizedStudents));
  const newSize = localStorage.getItem(STORAGE_KEY)?.length || 0;
  
  return {
    freed: Math.round((oldSize - newSize) / 1024),
    newSize: Math.round(newSize / 1024)
  };
};

// Supprimer les photos des anciens étudiants pour libérer de l'espace
export const removeOldPhotos = (keepLast: number = 10): { removed: number } => {
  const students = getStudents();
  if (students.length <= keepLast) return { removed: 0 };
  
  // Trier par date de création et supprimer les photos des plus anciens
  const sorted = [...students].sort((a, b) => 
    new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
  );
  
  let removed = 0;
  const updated = sorted.map((student, index) => {
    if (index >= keepLast && student.photo) {
      removed++;
      return { ...student, photo: '' };
    }
    return student;
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return { removed };
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
  // Nettoyer avant d'ajouter
  cleanupOldData();
  
  const students = getStudents();
  const id = uuidv4();
  
  // Compresser la photo avec compression agressive
  let compressedPhoto = studentData.photo;
  if (studentData.photo) {
    compressedPhoto = await compressImage(studentData.photo, 150, 0.3);
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
      // Tenter d'optimiser automatiquement
      console.log("Quota dépassé, tentative d'optimisation...");
      
      // Étape 1: Optimiser les photos existantes
      await optimizeStorage();
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      } catch (retryError) {
        // Étape 2: Supprimer les photos des anciens étudiants
        removeOldPhotos(5);
        
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        } catch (finalError) {
          const { percentage } = getStorageUsage();
          throw new Error(`QUOTA_EXCEEDED: Stockage plein (${percentage}% utilisé). Supprimez des étudiants dans la liste.`);
        }
      }
    } else {
      throw error;
    }
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
    updates.photo = await compressImage(updates.photo, 150, 0.3);
  }
  
  students[index] = { ...students[index], ...updates };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      await optimizeStorage();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      } catch (retryError) {
        throw new Error("QUOTA_EXCEEDED: Stockage plein. Supprimez des étudiants.");
      }
    } else {
      throw error;
    }
  }
  
  return students[index];
};

export const clearAllStudents = (): void => {
  // Supprimer directement la clé des étudiants
  localStorage.removeItem(STORAGE_KEY);
  
  // Collecter toutes les clés à supprimer
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('temp_') || key.startsWith('cache_') || key.startsWith('draft_') || key.startsWith('ises_'))) {
      keysToRemove.push(key);
    }
  }
  
  // Supprimer toutes les clés collectées
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // S'assurer que la clé principale est bien supprimée
  localStorage.removeItem(STORAGE_KEY);
};

export const getStorageInfo = (): { studentCount: number; usedKB: number; percentage: number; availableKB: number } => {
  const students = getStudents();
  const { used, available, percentage } = getStorageUsage();
  return {
    studentCount: students.length,
    usedKB: Math.round(used / 1024),
    percentage,
    availableKB: Math.round(available / 1024)
  };
};
