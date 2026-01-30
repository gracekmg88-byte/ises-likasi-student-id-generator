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
    switch (template.style) {
      case "modern":
        return {
          primary: [26, 54, 93] as [number, number, number],
          secondary: [234, 179, 8] as [number, number, number],
          accent: [30, 41, 59] as [number, number, number],
          bg: [255, 255, 255] as [number, number, number],
          textDark: [15, 23, 42] as [number, number, number],
        };
      case "advanced":
        return {
          primary: [26, 54, 93] as [number, number, number],
          secondary: [234, 179, 8] as [number, number, number],
          accent: [30, 58, 138] as [number, number, number],
          bg: [255, 255, 255] as [number, number, number],
          textDark: [15, 23, 42] as [number, number, number],
        };
      case "premium":
        return {
          primary: [26, 54, 93] as [number, number, number],
          secondary: [234, 179, 8] as [number, number, number],
          accent: [71, 85, 105] as [number, number, number],
          bg: [248, 250, 252] as [number, number, number],
          textDark: [15, 23, 42] as [number, number, number],
        };
      default:
        return {
          primary: [26, 54, 93] as [number, number, number],
          secondary: [234, 179, 8] as [number, number, number],
          accent: [17, 24, 39] as [number, number, number],
          bg: [255, 255, 255] as [number, number, number],
          textDark: [15, 23, 42] as [number, number, number],
        };
    }
  };

  const colors = getColors();

  // Generate QR Code
  let qrDataUrl: string = "";
  try {
    if (student.customQrCode) {
      qrDataUrl = student.customQrCode;
    } else {
      const verificationUrl = `${window.location.origin}/verification/${student.qrCodeData}`;
      qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 200,
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

// ===== VERSO COMMUN AMÉLIORÉ =====
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
  // Fond clair
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // En-tête avec fond bleu
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, width, 10, "F");

  // Logos dans l'en-tête
  if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", 2, 1.5, 7, 7);
    } catch (e) {}
  }
  if (institution.logoDroite) {
    try {
      doc.addImage(institution.logoDroite, "PNG", width - 9, 1.5, 7, 7);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", width - 9, 1.5, 7, 7);
    } catch (e) {}
  }

  // Titre CARTE D'ÉTUDIANT - PLUS GRAND
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 5, { align: "center" });
  
  // Nom institution - PLUS VISIBLE
  doc.setFontSize(3.5);
  doc.setTextColor(...colors.secondary);
  doc.text(institution.nom.substring(0, 45), width / 2, 8.5, { align: "center" });

  // QR Code au verso si configuré - PLUS GRAND
  if (qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(width / 2 - 10, 12, 20, 20, 1, 1, "F");
      doc.addImage(qrDataUrl, "PNG", width / 2 - 9, 13, 18, 18);
    } catch (e) {}
  }

  // Texte officiel - MEILLEUR CONTRASTE
  const textY = qrOnVerso ? 35 : 14;
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(2.8);
  doc.setFont("helvetica", "normal");
  
  const texteVerso = institution.texteVerso || 
    "Cette carte est strictement personnelle et non transférable. Elle est valide uniquement pour l'année académique en cours. En cas de perte, prière de la retourner à l'établissement émetteur.";
  
  const lines = doc.splitTextToSize(texteVerso, width - 12);
  doc.text(lines, width / 2, textY, { align: "center" });

  // Zone signature et cachet - TITRES PLUS GRANDS
  const signatureY = height - 16;
  
  // Label Cachet
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(6, signatureY - 2, 12, 3, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("CACHET", 12, signatureY);

  // Zone cachet
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.roundedRect(6, signatureY + 2, 20, 12, 1, 1);
  if (institution.cachetImage) {
    try {
      doc.addImage(institution.cachetImage, "PNG", 7, signatureY + 3, 18, 10);
    } catch (e) {}
  }

  // Label Signature
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 30, signatureY - 2, 16, 3, 0.5, 0.5, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("SIGNATURE", width - 22, signatureY);

  // Zone signature
  doc.roundedRect(width - 30, signatureY + 2, 24, 12, 1, 1);
  if (institution.signatureImage) {
    try {
      doc.addImage(institution.signatureImage, "PNG", width - 29, signatureY + 3, 22, 8);
    } catch (e) {}
  }
  doc.setTextColor(...colors.primary);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text(institution.mentionSignature, width - 18, signatureY + 13, { align: "center" });

  // Pied de page
  doc.setFillColor(245, 247, 250);
  doc.rect(0, height - 3.5, width, 3.5, "F");
  doc.setTextColor(...colors.accent);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Vérifiez l'authenticité : scannez le QR Code ou visitez notre portail", width / 2, height - 1.2, { align: "center" });
};

// ===== RECTO CLASSIQUE AMÉLIORÉ =====
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
  // Fond blanc pour meilleur contraste
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // En-tête bleu
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, width, 12, "F");

  // Logos
  if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", 2, 1.5, 9, 9);
    } catch (e) {}
  }
  if (institution.logoDroite) {
    try {
      doc.addImage(institution.logoDroite, "PNG", width - 11, 1.5, 9, 9);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", width - 11, 1.5, 9, 9);
    } catch (e) {}
  }

  // Texte en-tête - PLUS GRAND
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  const tutelleParts = institution.tutelle.split("–");
  doc.text(tutelleParts[0]?.trim() || "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", width / 2, 3.5, { align: "center" });

  doc.setFontSize(3.5);
  doc.setTextColor(...colors.secondary);
  doc.text(tutelleParts[1]?.trim() || "Enseignement Supérieur", width / 2, 6.5, { align: "center" });

  // Badge CARTE D'ÉTUDIANT - PLUS VISIBLE
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width / 2 - 14, 8, 28, 4, 0.8, 0.8, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 10.8, { align: "center" });

  // Ligne institution
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 12, width, 5, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text(institution.nom.substring(0, 55), width / 2, 15.2, { align: "center" });

  // Photo avec cadre
  if (student.photo) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(3.5, 18.5, 19, 23, 0.5, 0.5, "F");
      doc.addImage(student.photo, "JPEG", 4, 19, 18, 22);
    } catch (e) {}
  }

  // Informations avec labels jaunes - TAILLES AGRANDIES
  const infoX = 26;
  let infoY = 20;

  // Label NOMS
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 10, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("NOMS", infoX + 1, infoY + 0.3);

  // Valeur NOMS - PLUS GRANDE
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text(`${student.nom} ${student.prenom}`.substring(0, 22), infoX, infoY + 5);

  infoY += 9;

  // Label FACULTÉ
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 12, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("FACULTÉ", infoX + 1, infoY + 0.3);

  // Valeur FACULTÉ
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.faculte.substring(0, 30), infoX, infoY + 5);

  infoY += 9;

  // Labels PROMOTION et ANNÉE côte à côte
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 16, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("PROMOTION", infoX + 1, infoY + 0.3);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX + 22, infoY - 2, 12, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("ANNÉE", infoX + 23, infoY + 0.3);

  // Valeurs PROMOTION et ANNÉE
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.promotion, infoX, infoY + 5);
  doc.text(student.anneeAcademique, infoX + 22, infoY + 5);

  // QR Code (si pas au verso)
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(width - 19, 19, 15, 15, 0.5, 0.5, "F");
      doc.addImage(qrDataUrl, "PNG", width - 18, 20, 13, 13);
    } catch (e) {}
  }

  // Footer
  doc.setFillColor(245, 247, 250);
  doc.rect(0, height - 9, width, 9, "F");

  // Label Date Expiration
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 30, height - 8, 18, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("DATE EXPIRATION", width - 29, height - 5.5);

  doc.setTextColor(...colors.primary);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 21, height - 1.5, { align: "center" });

  // Signature
  doc.setTextColor(...colors.accent);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Chef d'établissement:", 4, height - 5);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.mentionSignature, 4, height - 1.5);
};

// ===== RECTO MODERNE AMÉLIORÉ =====
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

  // En-tête bleu gradient effect
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, width, 10, "F");

  const logo = institution.logoGauche || institution.logoDroite;
  if (logo) {
    try {
      doc.addImage(logo, "PNG", 3, 1.5, 7, 7);
    } catch (e) {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.nom.substring(0, 45), 12, 4.5);
  doc.setFontSize(3);
  doc.setFont("helvetica", "normal");
  doc.text(institution.tutelle.substring(0, 55), 12, 7.5);

  // Badge ÉTUDIANT
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 20, 11, 16, 4.5, 1, 1, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text("ÉTUDIANT", width - 12, 14, { align: "center" });

  // Photo avec cadre moderne
  if (student.photo) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(4.5, 14.5, 19, 23, 1, 1, "F");
      doc.addImage(student.photo, "JPEG", 5, 15, 18, 22);
    } catch (e) {}
  }

  // Informations avec labels jaunes - AGRANDIS
  const infoX = 27;
  let infoY = 17;

  // Label NOMS
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 10, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("NOMS", infoX + 1, infoY + 0.3);

  // Valeur NOMS
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text(`${student.nom} ${student.prenom}`.substring(0, 20), infoX, infoY + 5);

  infoY += 9;

  // Label FACULTÉ
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 12, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("FACULTÉ", infoX + 1, infoY + 0.3);

  // Valeur FACULTÉ
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.faculte.substring(0, 28), infoX, infoY + 5);

  infoY += 9;

  // Labels PROMOTION et ANNÉE
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 16, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("PROMOTION", infoX + 1, infoY + 0.3);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX + 22, infoY - 2, 12, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("ANNÉE", infoX + 23, infoY + 0.3);

  // Valeurs
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.promotion, infoX, infoY + 5);
  doc.text(student.anneeAcademique, infoX + 22, infoY + 5);

  // QR
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(width - 18, 18, 14, 14, 0.8, 0.8, "F");
      doc.addImage(qrDataUrl, "PNG", width - 17, 19, 12, 12);
    } catch (e) {}
  }

  // Footer
  doc.setFillColor(245, 247, 250);
  doc.rect(0, height - 8, width, 8, "F");

  // Signature
  doc.setTextColor(...colors.accent);
  doc.setFontSize(2.5);
  doc.text("Chef d'établissement:", 4, height - 5);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.mentionSignature, 4, height - 1.5);

  // Date expiration
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 28, height - 7, 18, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.text("DATE EXPIRATION", width - 27, height - 4.5);
  doc.setTextColor(...colors.primary);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 19, height - 1, { align: "center" });
};

// ===== RECTO AVANCÉ AMÉLIORÉ =====
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

  // En-tête dégradé
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, width, 11, "F");

  // Logos
  if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", 2, 1.5, 8, 8);
    } catch (e) {}
  }
  if (institution.logoDroite) {
    try {
      doc.addImage(institution.logoDroite, "PNG", width - 10, 1.5, 8, 8);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", width - 10, 1.5, 8, 8);
    } catch (e) {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.tutelle.split("–")[0]?.trim() || "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", width / 2, 4, { align: "center" });

  // Badge stylisé
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width / 2 - 16, 6, 32, 4.5, 1, 1, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 9, { align: "center" });

  // Nom institution
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 11, width, 5, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text(institution.nom.substring(0, 50), width / 2, 14.2, { align: "center" });

  // Photo avec cadre doré
  if (student.photo) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(3.5, 17.5, 19, 23, 1, 1, "F");
      doc.addImage(student.photo, "JPEG", 4, 18, 18, 22);
    } catch (e) {}
  }

  // Informations - AGRANDIES
  const infoX = 26;
  let infoY = 19;

  // Label NOMS
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 10, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("NOMS", infoX + 1, infoY + 0.3);

  // Valeur NOMS
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text(`${student.nom} ${student.prenom}`.substring(0, 20), infoX, infoY + 5);

  infoY += 9;

  // Label FACULTÉ
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 12, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("FACULTÉ", infoX + 1, infoY + 0.3);

  // Valeur FACULTÉ
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.faculte.substring(0, 28), infoX, infoY + 5);

  infoY += 9;

  // Labels PROMOTION et ANNÉE
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 16, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("PROMOTION", infoX + 1, infoY + 0.3);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX + 22, infoY - 2, 12, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("ANNÉE", infoX + 23, infoY + 0.3);

  // Valeurs
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.promotion, infoX, infoY + 5);
  doc.text(student.anneeAcademique, infoX + 22, infoY + 5);

  // QR avec effet
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(width - 18.5, 18.5, 14, 14, 1, 1, "F");
      doc.addImage(qrDataUrl, "PNG", width - 17.5, 19.5, 12, 12);
    } catch (e) {}
  }

  // Footer
  doc.setFillColor(245, 247, 250);
  doc.rect(0, height - 9, width, 9, "F");

  // Signature
  doc.setTextColor(...colors.accent);
  doc.setFontSize(2.5);
  doc.text("Chef d'établissement:", 4, height - 5.5);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.mentionSignature, 4, height - 2);

  // Date expiration
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 28, height - 8, 18, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.text("DATE EXPIRATION", width - 27, height - 5.5);
  doc.setTextColor(...colors.primary);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 19, height - 1.5, { align: "center" });
};

// ===== RECTO PREMIUM AMÉLIORÉ =====
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
  // Fond blanc pour meilleur contraste
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Bande dorée supérieure
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 0, width, 1.5, "F");

  // En-tête bleu
  doc.setFillColor(...colors.primary);
  doc.rect(0, 1.5, width, 12, "F");

  // Logos avec cercle doré
  if (institution.logoGauche) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.circle(8, 8, 6, "F");
      doc.addImage(institution.logoGauche, "PNG", 3, 3, 10, 10);
    } catch (e) {}
  }
  if (institution.logoDroite) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.circle(width - 8, 8, 6, "F");
      doc.addImage(institution.logoDroite, "PNG", width - 13, 3, 10, 10);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.circle(width - 8, 8, 6, "F");
      doc.addImage(institution.logoGauche, "PNG", width - 13, 3, 10, 10);
    } catch (e) {}
  }

  // Texte en-tête - PLUS GRAND
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", width / 2, 5, { align: "center" });

  // Sous-titre tutelle
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width / 2 - 30, 6, 60, 4, 0.8, 0.8, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("ENSEIGNEMENT SUPÉRIEUR ET UNIVERSITAIRE", width / 2, 8.5, { align: "center" });

  // Badge CARTE D'ÉTUDIANT - PLUS VISIBLE
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(width / 2 - 17, 10.5, 34, 5, 1, 1, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 14, { align: "center" });

  // Nom de l'institution
  doc.setTextColor(...colors.primary);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.nom.substring(0, 38), width / 2, 19, { align: "center" });

  // Photo avec cadre doré
  if (student.photo) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(3.5, 21.5, 19, 23, 0.8, 0.8, "F");
      doc.addImage(student.photo, "JPEG", 4, 22, 18, 22);
    } catch (e) {}
  }

  // Informations - TAILLES MAXIMALES POUR LISIBILITÉ
  const infoX = 26;
  let infoY = 23;

  // Label NOMS
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 10, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("NOMS", infoX + 1, infoY + 0.3);

  // Valeur NOMS - TRÈS GRANDE
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text(`${student.nom} ${student.prenom}`.substring(0, 18), infoX, infoY + 5.5);

  infoY += 10;

  // Label FACULTÉ
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 12, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("FACULTÉ", infoX + 1, infoY + 0.3);

  // Valeur FACULTÉ
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(student.faculte.substring(0, 26), infoX, infoY + 5.5);

  infoY += 10;

  // Labels PROMOTION et ANNÉE côte à côte
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 2, 16, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("PROMOTION", infoX + 1, infoY + 0.3);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX + 22, infoY - 2, 12, 3.5, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("ANNÉE", infoX + 23, infoY + 0.3);

  // Valeurs
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(student.promotion, infoX, infoY + 5);
  doc.text(student.anneeAcademique, infoX + 22, infoY + 5);

  // QR Code
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(width - 19, 22, 15, 15, 0.8, 0.8, "F");
      doc.addImage(qrDataUrl, "PNG", width - 18, 23, 13, 13);
    } catch (e) {}
  }

  // Footer avec fond bleu
  doc.setFillColor(...colors.primary);
  doc.rect(0, height - 8, width, 8, "F");

  // Signature
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Chef d'établissement:", 4, height - 5);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.mentionSignature, 4, height - 1.5);

  // DATE EXPIRATION
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 30, height - 7, 9, 3, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "bold");
  doc.text("DATE", width - 29.5, height - 5);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 20, height - 7, 16, 3, 0.4, 0.4, "F");
  doc.setTextColor(...colors.textDark);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "bold");
  doc.text("EXPIRATION", width - 19.5, height - 5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 15, height - 1, { align: "center" });

  // Bande dorée inférieure
  doc.setFillColor(...colors.secondary);
  doc.rect(0, height - 0.8, width, 0.8, "F");
};
