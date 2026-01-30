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
  // Système de crédits de cartes
  cardsGenerated: number;        // Cartes générées (essai + premium)
  cardsQuota: number;            // Quota total de cartes autorisées (0 = essai gratuit)
  freeTrialUsed: number;         // Cartes utilisées pendant l'essai (max 3)
}

export interface PaymentSettings {
  mobileMoneyNumber: string;
  mobileMoneyBeneficiary: string;
  bankName: string;
  bankAccountUSD: string;
  bankAccountCDF: string;
  bankBeneficiary: string;
  whatsappNumber: string;
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
