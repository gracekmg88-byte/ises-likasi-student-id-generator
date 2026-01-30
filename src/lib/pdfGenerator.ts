import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Student, Institution, CardTemplate } from "@/types/student";

export const generateStudentCardPDF = async (
  student: Student,
  institution: Institution,
  template: CardTemplate
): Promise<void> => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [85.6, 54],
  });

  const width = 85.6;
  const height = 54;
  const qrOnVerso = student.qrPosition === "verso";

  const getColors = () => {
    // Jaune plus doux et élégant pour un meilleur contraste et rendu professionnel
    const elegantYellow: [number, number, number] = [245, 197, 56];
    
    switch (template.style) {
      case "modern":
        return {
          primary: [26, 54, 93] as [number, number, number],
          secondary: elegantYellow,
          accent: [30, 41, 59] as [number, number, number],
          bg: [255, 255, 255] as [number, number, number],
          textDark: [15, 23, 42] as [number, number, number],
        };
      case "advanced":
        return {
          primary: [26, 54, 93] as [number, number, number],
          secondary: elegantYellow,
          accent: [30, 58, 138] as [number, number, number],
          bg: [255, 255, 255] as [number, number, number],
          textDark: [15, 23, 42] as [number, number, number],
        };
      case "premium":
        return {
          primary: [26, 54, 93] as [number, number, number],
          secondary: elegantYellow,
          accent: [71, 85, 105] as [number, number, number],
          bg: [248, 250, 252] as [number, number, number],
          textDark: [15, 23, 42] as [number, number, number],
        };
      default:
        return {
          primary: [26, 54, 93] as [number, number, number],
          secondary: elegantYellow,
          accent: [17, 24, 39] as [number, number, number],
          bg: [255, 255, 255] as [number, number, number],
          textDark: [15, 23, 42] as [number, number, number],
        };
    }
  };

  const colors = getColors();

  // Generate QR Code - haute résolution pour impression
  let qrDataUrl: string = "";
  try {
    if (student.customQrCode) {
      qrDataUrl = student.customQrCode;
    } else {
      const verificationUrl = `${window.location.origin}/verification/${student.qrCodeData}`;
      qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 400, // Haute résolution pour impression
        margin: 1,
        color: { dark: "#1a365d", light: "#ffffff" },
      });
    }
  } catch (e) {
    console.error("Erreur QR Code:", e);
  }

  // ===== PAGE 1: RECTO =====
  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, width, height, "F");

  switch (template.style) {
    case "modern":
      await renderModernRecto(doc, student, institution, colors, width, height, qrDataUrl, qrOnVerso);
      break;
    case "advanced":
      await renderAdvancedRecto(doc, student, institution, colors, width, height, qrDataUrl, qrOnVerso);
      break;
    case "premium":
      await renderPremiumRecto(doc, student, institution, colors, width, height, qrDataUrl, qrOnVerso);
      break;
    default:
      await renderClassicRecto(doc, student, institution, colors, width, height, qrDataUrl, qrOnVerso);
  }

  // ===== PAGE 2: VERSO =====
  doc.addPage([85.6, 54], "landscape");
  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, width, height, "F");
  await renderVerso(doc, student, institution, colors, width, height, qrDataUrl, qrOnVerso);

  const fileName = `carte_${template.style}_${student.nom}_${student.prenom}.pdf`;
  doc.save(fileName);
};

// ===== VERSO COMMUN - CORRESPONDANCE EXACTE AVEC L'APERÇU =====
const renderVerso = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number]; textDark: [number, number, number] },
  width: number,
  height: number,
  qrDataUrl: string,
  qrOnVerso: boolean
) => {
  // Fond blanc identique à l'aperçu
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Bordure bleue de la carte
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(1.2);
  doc.rect(0.6, 0.6, width - 1.2, height - 1.2);

  // En-tête bleu - hauteur identique à l'aperçu
  doc.setFillColor(...colors.primary);
  doc.rect(1.5, 1.5, width - 3, 9, "F");

  // Logo gauche dans cercle blanc rempli - logo agrandi pour remplir le cercle
  doc.setFillColor(255, 255, 255);
  doc.circle(7, 6, 4, "F");
  if (institution.logoGauche) {
    try {
      // Logo agrandi pour remplir le cercle (rayon 4mm = diamètre 8mm)
      doc.addImage(institution.logoGauche, "PNG", 3, 2, 8, 8);
    } catch (e) {}
  }

  // Logo droite dans cercle blanc rempli - logo agrandi pour remplir le cercle
  doc.setFillColor(255, 255, 255);
  doc.circle(width - 7, 6, 4, "F");
  if (institution.logoDroite) {
    try {
      doc.addImage(institution.logoDroite, "PNG", width - 11, 2, 8, 8);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", width - 11, 2, 8, 8);
    } catch (e) {}
  }

  // Titre CARTE D'ÉTUDIANT - centré
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 5.5, { align: "center" });
  
  // Nom institution en jaune
  doc.setFontSize(3);
  doc.setTextColor(...colors.secondary);
  doc.text(institution.nom.substring(0, 50), width / 2, 8.5, { align: "center" });

  // Zone de contenu blanche
  const contentY = 12;

  // Texte officiel avec meilleur contraste
  doc.setTextColor(90, 30, 30); // Rouge foncé comme sur l'aperçu
  doc.setFontSize(2.6);
  doc.setFont("helvetica", "normal");
  
  const texteVerso = institution.texteVerso || 
    "Cette carte est strictement personnelle et non transférable. Elle est valide uniquement pour l'année académique en cours. En cas de perte, prière de la retourner à l'établissement.";
  
  const lines = doc.splitTextToSize(texteVerso, width - 10);
  doc.text(lines, width / 2, contentY + 2, { align: "center" });

  // Ligne de séparation
  doc.setDrawColor(200, 100, 100);
  doc.setLineWidth(0.2);
  doc.line(6, contentY + 8, width - 6, contentY + 8);

  // Zone cachet et signature
  const signatureY = contentY + 11;
  
  // Zone cachet (rectangle en pointillés)
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.15);
  doc.setLineDashPattern([0.5, 0.5], 0);
  doc.roundedRect(6, signatureY, 18, 14, 0.5, 0.5);
  doc.setLineDashPattern([], 0);
  
  if (institution.cachetImage) {
    try {
      doc.addImage(institution.cachetImage, "PNG", 7, signatureY + 1, 16, 10);
    } catch (e) {}
  } else {
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(2.5);
    doc.text("Cachet", 15, signatureY + 8, { align: "center" });
  }

  // Zone signature avec ligne
  doc.setDrawColor(180, 180, 180);
  doc.line(width - 30, signatureY + 10, width - 6, signatureY + 10);
  
  if (institution.signatureImage) {
    try {
      doc.addImage(institution.signatureImage, "PNG", width - 28, signatureY + 2, 20, 8);
    } catch (e) {}
  }
  
  // Label signature
  doc.setTextColor(...colors.primary);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text(institution.mentionSignature, width - 18, signatureY + 13, { align: "center" });

  // QR Code au verso si configuré
  if (qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(width / 2 - 8, signatureY - 2, 16, 16, 0.5, 0.5, "F");
      doc.addImage(qrDataUrl, "PNG", width / 2 - 7, signatureY - 1, 14, 14);
    } catch (e) {}
  }

  // Pied de page - fond gris clair
  doc.setFillColor(245, 247, 250);
  doc.rect(1.5, height - 5, width - 3, 3.5, "F");
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(2.3);
  doc.setFont("helvetica", "normal");
  doc.text("Vérifiez l'authenticité : scannez le QR Code ou visitez notre portail de vérification", width / 2, height - 2.8, { align: "center" });
};

// ===== RECTO CLASSIQUE - CORRESPONDANCE EXACTE AVEC L'APERÇU =====
const renderClassicRecto = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number]; textDark: [number, number, number] },
  width: number,
  height: number,
  qrDataUrl: string,
  qrOnVerso: boolean
) => {
  // Fond blanc
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Bordure jaune de la carte
  doc.setDrawColor(...colors.secondary);
  doc.setLineWidth(1.5);
  doc.rect(0.75, 0.75, width - 1.5, height - 1.5);

  // En-tête bleu
  doc.setFillColor(...colors.primary);
  doc.rect(1.5, 1.5, width - 3, 11, "F");

  // Logo gauche dans cercle blanc rempli - logo agrandi pour remplir le cercle (comme le verso)
  doc.setFillColor(255, 255, 255);
  doc.circle(8, 7, 5.5, "F");
  if (institution.logoGauche) {
    try {
      // Logo agrandi pour remplir tout le cercle - dimensions identiques au verso
      doc.addImage(institution.logoGauche, "PNG", 2.5, 1.5, 11, 11);
    } catch (e) {}
  }

  // Logo droite dans cercle blanc rempli - logo agrandi pour remplir le cercle (comme le verso)
  doc.setFillColor(255, 255, 255);
  doc.circle(width - 8, 7, 5.5, "F");
  if (institution.logoDroite) {
    try {
      doc.addImage(institution.logoDroite, "PNG", width - 13.5, 1.5, 11, 11);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", width - 13.5, 1.5, 11, 11);
    } catch (e) {}
  }

  // Texte en-tête - titre ENSEIGNEMENT SUPÉRIEUR plus visible
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  const tutelleParts = institution.tutelle.split("–");
  doc.text(tutelleParts[0]?.trim() || "ENSEIGNEMENT SUPÉRIEUR ET UNIVERSITAIRE", width / 2, 4, { align: "center" });

  // Nom institution
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.nom.substring(0, 45), width / 2, 7.5, { align: "center" });

  // Badge CARTE D'ÉTUDIANT jaune
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width / 2 - 16, 9, 32, 4.5, 0.8, 0.8, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 12, { align: "center" });

  // Photo avec cadre
  const photoX = 4;
  const photoY = 15;
  const photoW = 18;
  const photoH = 22;
  
  if (student.photo) {
    try {
      // Cadre photo
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.5);
      doc.rect(photoX - 0.5, photoY - 0.5, photoW + 1, photoH + 1);
      // Photo avec compression minimale pour conserver la qualité
      doc.addImage(student.photo, "JPEG", photoX, photoY, photoW, photoH, undefined, "FAST");
    } catch (e) {}
  }

  // Informations avec labels jaunes - exactement comme l'aperçu
  const infoX = 26;
  let infoY = 17;

  // Label NOMS - bande jaune
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 12, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("NOMS", infoX + 1.5, infoY + 0.3);

  // Valeur NOMS - nom complet sur une ligne cohérente
  const fullName = `${student.nom.toUpperCase()} ${student.prenom}`;
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  // Gestion automatique des retours à la ligne pour les noms longs
  const nameLines = doc.splitTextToSize(fullName, 32);
  doc.text(nameLines, infoX, infoY + 4.5);

  infoY += nameLines.length > 1 ? 11 : 9;

  // Labels FACULTÉ et PROMOTION côte à côte
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 14, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("FACULTÉ", infoX + 1.5, infoY + 0.3);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX + 22, infoY - 2, 18, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("PROMOTION", infoX + 23.5, infoY + 0.3);

  // Valeur FACULTÉ avec retour à la ligne automatique
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  const faculteLines = doc.splitTextToSize(student.faculte, 18);
  doc.text(faculteLines, infoX, infoY + 4.5);
  doc.text(student.promotion, infoX + 22, infoY + 4.5);

  infoY += faculteLines.length > 1 ? 10 : 8;

  // Label ANNÉE
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 12, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("ANNÉE", infoX + 1.5, infoY + 0.3);

  // Valeur
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.anneeAcademique, infoX, infoY + 4.5);

  // QR Code à droite (si pas au verso) - exactement comme l'aperçu
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(width - 20, 16, 16, 16, 0.5, 0.5, "F");
      doc.addImage(qrDataUrl, "PNG", width - 19, 17, 14, 14);
    } catch (e) {}
  }

  // Footer - Zone signature et expiration (SANS texte additionnel sous les labels)
  const footerY = height - 8;
  
  // Label signature à gauche - UNIQUEMENT le label jaune, pas de texte en dessous
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(4, footerY, 18, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text(institution.mentionSignature.toUpperCase(), 5.5, footerY + 2.3);

  // Label EXPIRE LE à droite
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 24, footerY, 18, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("EXPIRE LE", width - 22.5, footerY + 2.3);

  // Date d'expiration en dessous du label
  doc.setTextColor(...colors.primary);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 15, footerY + 7, { align: "center" });
};

// ===== RECTO MODERNE - CORRESPONDANCE EXACTE AVEC L'APERÇU =====
const renderModernRecto = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number]; textDark: [number, number, number] },
  width: number,
  height: number,
  qrDataUrl: string,
  qrOnVerso: boolean
) => {
  // Fond blanc
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Bordure grise subtile
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(0.5, 0.5, width - 1, height - 1, 2, 2);

  // En-tête bleu
  doc.setFillColor(...colors.primary);
  doc.roundedRect(1.5, 1.5, width - 3, 10, 1.5, 1.5, "F");

  // Logo dans cercle blanc rempli
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(3, 2.5, 8, 8, 1, 1, "F");
  const logo = institution.logoGauche || institution.logoDroite;
  if (logo) {
    try {
      doc.addImage(logo, "PNG", 3.5, 3, 7, 7);
    } catch (e) {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.nom.substring(0, 40), 13, 5.5);
  doc.setFontSize(2.8);
  doc.setFont("helvetica", "normal");
  doc.text(institution.tutelle.substring(0, 50), 13, 8.5);

  // Badge ÉTUDIANT
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 18, 12.5, 14, 4, 1, 1, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text("ÉTUDIANT", width - 11, 15, { align: "center" });

  // Photo avec cadre moderne
  const photoX = 4;
  const photoY = 15;
  if (student.photo) {
    try {
      doc.setFillColor(...colors.primary);
      doc.roundedRect(photoX - 0.5, photoY - 0.5, 19, 23, 1, 1, "F");
      doc.addImage(student.photo, "JPEG", photoX, photoY, 18, 22, undefined, "FAST");
    } catch (e) {}
  }

  // Informations avec labels jaunes
  const infoX = 27;
  let infoY = 17;

  // Label NOMS
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 12, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("NOMS", infoX + 1.5, infoY + 0.3);

  // Valeur NOMS - nom complet cohérent
  const fullName = `${student.nom} ${student.prenom}`;
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  const nameLines = doc.splitTextToSize(fullName, 30);
  doc.text(nameLines, infoX, infoY + 5);

  infoY += nameLines.length > 1 ? 11 : 9;

  // Label FACULTÉ
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 14, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("FACULTÉ", infoX + 1.5, infoY + 0.3);

  // Valeur FACULTÉ avec retour à la ligne
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  const faculteLines = doc.splitTextToSize(student.faculte, 28);
  doc.text(faculteLines, infoX, infoY + 4.5);

  infoY += faculteLines.length > 1 ? 10 : 8;

  // Labels PROMOTION et ANNÉE
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 16, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("PROMOTION", infoX + 1, infoY + 0.3);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX + 22, infoY - 2, 12, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("ANNÉE", infoX + 23, infoY + 0.3);

  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.promotion, infoX, infoY + 5);
  doc.text(student.anneeAcademique, infoX + 22, infoY + 5);

  // QR
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(width - 17, 18, 13, 13, 0.8, 0.8, "F");
      doc.addImage(qrDataUrl, "PNG", width - 16, 19, 11, 11);
    } catch (e) {}
  }

  // Footer
  doc.setFillColor(245, 247, 250);
  doc.rect(1.5, height - 7, width - 3, 5.5, "F");

  doc.setTextColor(...colors.accent);
  doc.setFontSize(2.8);
  doc.text(institution.mentionSignature, 5, height - 3);

  // Date expiration
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 25, height - 6, 8, 3, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(2.8);
  doc.setFont("helvetica", "bold");
  doc.text("EXP:", width - 24, height - 4);
  
  doc.setTextColor(...colors.primary);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 10, height - 3.5, { align: "center" });
};

// ===== RECTO AVANCÉ - CORRESPONDANCE EXACTE AVEC L'APERÇU =====
const renderAdvancedRecto = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number]; textDark: [number, number, number] },
  width: number,
  height: number,
  qrDataUrl: string,
  qrOnVerso: boolean
) => {
  // Fond blanc
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Bordure bleue
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.8);
  doc.roundedRect(0.8, 0.8, width - 1.6, height - 1.6, 2, 2);

  // En-tête bleu avec dégradé simulé
  doc.setFillColor(...colors.primary);
  doc.roundedRect(1.5, 1.5, width - 3, 11, 1.5, 1.5, "F");

  // Logo gauche dans cercle blanc rempli
  doc.setFillColor(255, 255, 255);
  doc.circle(8, 7, 5, "F");
  if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", 4, 3, 8, 8);
    } catch (e) {}
  }

  // Logo droite dans cercle blanc rempli
  doc.setFillColor(255, 255, 255);
  doc.circle(width - 8, 7, 5, "F");
  if (institution.logoDroite) {
    try {
      doc.addImage(institution.logoDroite, "PNG", width - 12, 3, 8, 8);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", width - 12, 3, 8, 8);
    } catch (e) {}
  }

  // Texte en-tête
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.tutelle.split("–")[0]?.trim() || "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", width / 2, 4.5, { align: "center" });

  // Badge CARTE D'ÉTUDIANT - arrondi
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width / 2 - 17, 6.5, 34, 5, 2, 2, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 10, { align: "center" });

  // Nom institution
  doc.setFillColor(245, 247, 250);
  doc.rect(1.5, 13, width - 3, 4.5, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text(institution.nom.substring(0, 48), width / 2, 16, { align: "center" });

  // Photo avec cadre doré
  const photoX = 4;
  const photoY = 19;
  if (student.photo) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(photoX - 0.5, photoY - 0.5, 19, 23, 0.8, 0.8, "F");
      doc.addImage(student.photo, "JPEG", photoX, photoY, 18, 22, undefined, "FAST");
    } catch (e) {}
  }

  // Informations avec labels jaunes
  const infoX = 26;
  let infoY = 21;

  // Label NOMS
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2.5, 12, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("NOMS", infoX + 1.5, infoY - 0.2);

  // Valeur NOMS - nom complet cohérent
  const fullName = `${student.nom} ${student.prenom}`;
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  const nameLines = doc.splitTextToSize(fullName, 28);
  doc.text(nameLines, infoX, infoY + 4);

  infoY += nameLines.length > 1 ? 9 : 7;

  // MATRICULE - uniquement pour le modèle Advanced
  if (student.matricule) {
    doc.setFillColor(...colors.secondary);
    doc.roundedRect(infoX, infoY - 2, 16, 3.5, 0.5, 0.5, "F");
    doc.setTextColor(...colors.textDark);
    doc.setFontSize(3.2);
    doc.setFont("helvetica", "bold");
    doc.text("MATRICULE", infoX + 1.5, infoY + 0.3);

    doc.setTextColor(...colors.textDark);
    doc.setFontSize(4.5);
    doc.setFont("helvetica", "bold");
    doc.text(student.matricule.substring(0, 18), infoX, infoY + 5);

    infoY += 7;
  }

  // Label FACULTÉ
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 14, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("FACULTÉ", infoX + 1.5, infoY + 0.3);

  // Valeur FACULTÉ avec retour à la ligne
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  const faculteLines = doc.splitTextToSize(student.faculte, 26);
  doc.text(faculteLines, infoX, infoY + 4.5);

  infoY += faculteLines.length > 1 ? 9 : 7;

  // Labels PROMOTION et ANNÉE côte à côte
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 16, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("PROMOTION", infoX + 1, infoY + 0.3);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX + 22, infoY - 2, 12, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("ANNÉE", infoX + 23, infoY + 0.3);

  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.promotion, infoX, infoY + 5);
  doc.text(student.anneeAcademique, infoX + 22, infoY + 5);

  // QR Code
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(width - 18, 19, 14, 14, 0.8, 0.8, "F");
      doc.addImage(qrDataUrl, "PNG", width - 17, 20, 12, 12);
    } catch (e) {}
  }

  // Footer
  doc.setFillColor(245, 247, 250);
  doc.rect(1.5, height - 8, width - 3, 6.5, "F");

  // Signature
  doc.setTextColor(...colors.accent);
  doc.setFontSize(2.8);
  doc.text(institution.mentionSignature, 5, height - 3);

  // Date expiration
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 26, height - 7, 18, 3.2, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("EXPIRE LE", width - 25, height - 4.8);

  doc.setTextColor(...colors.primary);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 17, height - 1.5, { align: "center" });
};

// ===== RECTO PREMIUM - CORRESPONDANCE EXACTE AVEC L'APERÇU =====
const renderPremiumRecto = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number]; textDark: [number, number, number] },
  width: number,
  height: number,
  qrDataUrl: string,
  qrOnVerso: boolean
) => {
  // Fond sombre comme l'aperçu Premium
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, width, height, "F");

  // Bande dorée supérieure
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 0, width, 1.2, "F");

  // Bordure dorée subtile
  doc.setDrawColor(...colors.secondary);
  doc.setLineWidth(0.5);
  doc.rect(0.5, 0.5, width - 1, height - 1);

  // Logo gauche dans cercle doré rempli
  doc.setFillColor(255, 255, 255);
  doc.circle(9, 9, 5.5, "F");
  if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", 4.5, 4.5, 9, 9);
    } catch (e) {}
  }

  // Logo droite dans cercle doré rempli
  doc.setFillColor(255, 255, 255);
  doc.circle(width - 9, 9, 5.5, "F");
  if (institution.logoDroite) {
    try {
      doc.addImage(institution.logoDroite, "PNG", width - 13.5, 4.5, 9, 9);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", width - 13.5, 4.5, 9, 9);
    } catch (e) {}
  }

  // Tutelle
  doc.setTextColor(...colors.secondary);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text(institution.tutelle.split("–")[0]?.trim() || "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", width / 2, 4, { align: "center" });

  // Nom institution en blanc
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.nom.substring(0, 40), width / 2, 8, { align: "center" });

  // Badge CARTE D'ÉTUDIANT doré
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width / 2 - 17, 10.5, 34, 5, 2, 2, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 14, { align: "center" });

  // Photo avec cadre doré
  const photoX = 4;
  const photoY = 18;
  if (student.photo) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(photoX - 0.5, photoY - 0.5, 19, 23, 0.8, 0.8, "F");
      doc.addImage(student.photo, "JPEG", photoX, photoY, 18, 22, undefined, "FAST");
    } catch (e) {}
  }

  // Informations avec labels dorés
  const infoX = 26;
  let infoY = 20;

  // Label NOMS - bande dorée
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 12, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(3.2);
  doc.setFont("helvetica", "bold");
  doc.text("NOMS", infoX + 1.5, infoY + 0.3);

  // Valeur NOMS - nom complet cohérent
  const fullName = `${student.nom.toUpperCase()} ${student.prenom}`;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  const nameLines = doc.splitTextToSize(fullName, 30);
  doc.text(nameLines, infoX, infoY + 5);

  infoY += nameLines.length > 1 ? 11 : 9;

  // Labels FACULTÉ et PROMOTION côte à côte
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 14, 3.2, 0.5, 0.5, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("FACULTÉ", infoX + 1.5, infoY + 0.3);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX + 22, infoY - 2, 18, 3.2, 0.5, 0.5, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("PROMOTION", infoX + 23.5, infoY + 0.3);

  // Valeur FACULTÉ avec retour à la ligne
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  const faculteLines = doc.splitTextToSize(student.faculte, 18);
  doc.text(faculteLines, infoX, infoY + 4.5);
  doc.text(student.promotion, infoX + 22, infoY + 4.5);

  infoY += faculteLines.length > 1 ? 10 : 8;

  // Label ANNÉE
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 12, 3.2, 0.5, 0.5, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("ANNÉE", infoX + 1.5, infoY + 0.3);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.anneeAcademique, infoX, infoY + 5);

  // QR Code à droite
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(width - 18, 19, 14, 14, 0.8, 0.8, "F");
      doc.addImage(qrDataUrl, "PNG", width - 17, 20, 12, 12);
    } catch (e) {}
  }

  // Hologramme simulé - cercle décoratif
  doc.setFillColor(200, 200, 200);
  doc.circle(width - 4, 36, 3, "F");

  // Footer sombre avec gradient
  const footerY = height - 9;
  
  // Label signature - UNIQUEMENT le label jaune, pas de texte en dessous (suppression du doublon)
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(4, footerY, 18, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text(institution.mentionSignature.toUpperCase(), 5.5, footerY + 2.3);

  // Label EXPIRE LE
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 24, footerY, 18, 3, 0.5, 0.5, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(2.8);
  doc.setFont("helvetica", "bold");
  doc.text("EXPIRE LE", width - 22.5, footerY + 2);

  doc.setTextColor(...colors.secondary);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 15, footerY + 7, { align: "center" });

  // Bande dorée inférieure
  doc.setFillColor(...colors.secondary);
  doc.rect(0, height - 0.8, width, 0.8, "F");
};
