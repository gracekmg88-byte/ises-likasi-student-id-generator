export interface Student {
  id: string;
  nom: string;
  prenom: string;
  photo: string;
  dateCreation: string;
  faculte: string;
  promotion: string;
  anneeAcademique: string;
  dateExpiration: string;
  qrCodeData: string;
  customQrCode?: string; // QR Code personnalisé uploadé
  institutionId?: string; // Lien vers l'institution
}

export interface Institution {
  id: string;
  nom: string;
  tutelle: string;
  mentionSignature: string;
  logoGauche?: string; // Base64 ou URL
  logoDroite?: string; // Base64 ou URL
  dateCreation: string;
}

export interface Admin {
  id: string;
  email: string;
  password: string;
  nom: string;
  dateCreation: string;
}

export interface CardTemplate {
  id: string;
  nom: string;
  description: string;
  style: 'classic' | 'modern' | 'advanced';
}

export type AdminCredentials = {
  username: string;
  password: string;
};
