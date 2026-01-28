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
}

export interface AdminCredentials {
  username: string;
  password: string;
}
