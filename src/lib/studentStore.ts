import { Student } from "@/types/student";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "ises_students";

export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getStudentById = (id: string): Student | undefined => {
  const students = getStudents();
  return students.find((s) => s.id === id);
};

export const addStudent = (studentData: Omit<Student, "id" | "qrCodeData" | "dateCreation">): Student => {
  const students = getStudents();
  const id = uuidv4();
  
  const newStudent: Student = {
    ...studentData,
    id,
    qrCodeData: id,
    dateCreation: new Date().toISOString(),
  };
  
  students.push(newStudent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  
  return newStudent;
};

export const deleteStudent = (id: string): void => {
  const students = getStudents();
  const filtered = students.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const updateStudent = (id: string, updates: Partial<Student>): Student | undefined => {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === id);
  
  if (index === -1) return undefined;
  
  students[index] = { ...students[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  
  return students[index];
};
