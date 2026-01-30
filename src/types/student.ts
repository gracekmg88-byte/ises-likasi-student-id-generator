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
  customQrCode?: string;
  institutionId?: string;
  qrPosition?: 'recto' | 'verso';
}

export interface Institution {
  id: string;
  nom: string;
  tutelle: string;
  mentionSignature: string;
  logoGauche?: string;
  logoDroite?: string;
  dateCreation: string;
  signatureImage?: string;
  cachetImage?: string;
  texteVerso?: string;
}

export interface Admin {
  id: string;
  email: string;
  password: string;
  nom: string;
  dateCreation: string;
}

export interface AppUser {
  id: string;
  email: string;
  password: string;
  nom: string;
  isPremium: boolean;
  dateCreation: string;
  dateActivation?: string;
  trialEndDate: string;
}

export interface CardTemplate {
  id: string;
  nom: string;
  description: string;
  style: 'classic' | 'modern' | 'advanced' | 'premium';
  isPremium: boolean;
}

export type AdminCredentials = {
  username: string;
  password: string;
};
