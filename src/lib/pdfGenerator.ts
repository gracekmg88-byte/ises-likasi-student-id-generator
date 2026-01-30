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
          primary: [51, 65, 85] as [number, number, number],
          secondary: [234, 179, 8] as [number, number, number],
          accent: [71, 85, 105] as [number, number, number],
          bg: [248, 250, 252] as [number, number, number],
        };
      case "advanced":
        return {
          primary: [26, 54, 93] as [number, number, number],
          secondary: [234, 179, 8] as [number, number, number],
          accent: [59, 130, 246] as [number, number, number],
          bg: [240, 245, 255] as [number, number, number],
        };
      case "premium":
        return {
          primary: [15, 23, 42] as [number, number, number],
          secondary: [234, 179, 8] as [number, number, number],
          accent: [148, 163, 184] as [number, number, number],
          bg: [30, 41, 59] as [number, number, number],
        };
      default:
        return {
          primary: [26, 54, 93] as [number, number, number],
          secondary: [234, 179, 8] as [number, number, number],
          accent: [17, 24, 39] as [number, number, number],
          bg: [248, 250, 252] as [number, number, number],
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

// ===== VERSO COMMUN =====
const renderVerso = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number] },
  width: number,
  height: number,
  qrDataUrl: string,
  qrOnVerso: boolean
) => {
  // En-tête
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, width, 8, "F");

  // Logos
  if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", 2, 1, 6, 6);
    } catch (e) {}
  }
  if (institution.logoDroite) {
    try {
      doc.addImage(institution.logoDroite, "PNG", width - 8, 1, 6, 6);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", width - 8, 1, 6, 6);
    } catch (e) {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 4, { align: "center" });
  doc.setFontSize(2.5);
  doc.setTextColor(...colors.secondary);
  doc.text(institution.nom.substring(0, 50), width / 2, 6.5, { align: "center" });

  // QR Code au verso si configuré
  if (qrOnVerso && qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", width / 2 - 8, 10, 16, 16);
    } catch (e) {}
  }

  // Texte officiel
  const grayLight: [number, number, number] = [107, 114, 128];
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.2);
  doc.setFont("helvetica", "normal");
  
  const texteVerso = institution.texteVerso || 
    "Cette carte est strictement personnelle et non transférable. Elle est valide uniquement pour l'année académique en cours. En cas de perte, prière de la retourner à l'établissement émetteur.";
  
  const textY = qrOnVerso ? 29 : 12;
  const lines = doc.splitTextToSize(texteVerso, width - 10);
  doc.text(lines, width / 2, textY, { align: "center" });

  // Zone signature et cachet
  const signatureY = height - 18;
  
  // Cachet
  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.2);
  doc.roundedRect(8, signatureY, 18, 12, 1, 1);
  if (institution.cachetImage) {
    try {
      doc.addImage(institution.cachetImage, "PNG", 9, signatureY + 1, 16, 10);
    } catch (e) {}
  } else {
    doc.setTextColor(...grayLight);
    doc.setFontSize(2);
    doc.text("Cachet", 17, signatureY + 7, { align: "center" });
  }

  // Signature
  doc.roundedRect(width - 30, signatureY, 22, 12, 1, 1);
  if (institution.signatureImage) {
    try {
      doc.addImage(institution.signatureImage, "PNG", width - 29, signatureY + 1, 20, 8);
    } catch (e) {}
  }
  doc.setTextColor(...colors.primary);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.mentionSignature, width - 19, signatureY + 11, { align: "center" });

  // Pied de page
  doc.setFillColor(240, 244, 248);
  doc.rect(0, height - 4, width, 4, "F");
  doc.setTextColor(...grayLight);
  doc.setFontSize(2);
  doc.setFont("helvetica", "normal");
  doc.text("Vérifiez l'authenticité : scannez le QR Code ou visitez notre portail de vérification", width / 2, height - 1.5, { align: "center" });
};

// ===== RECTO CLASSIQUE =====
const renderClassicRecto = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number] },
  width: number,
  height: number,
  qrDataUrl: string,
  qrOnVerso: boolean
) => {
  // En-tête bleu
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, width, 11, "F");

  // Logos
  if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", 2, 1, 9, 9);
    } catch (e) {}
  }
  if (institution.logoDroite) {
    try {
      doc.addImage(institution.logoDroite, "PNG", width - 11, 1, 9, 9);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", width - 11, 1, 9, 9);
    } catch (e) {}
  }

  // Texte en-tête
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  const tutelleParts = institution.tutelle.split("–");
  doc.text(tutelleParts[0]?.trim() || "", width / 2, 3, { align: "center" });

  doc.setFontSize(3);
  doc.setTextColor(...colors.secondary);
  doc.text(tutelleParts[1]?.trim() || "Enseignement Supérieur", width / 2, 5.5, { align: "center" });

  // Badge
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width / 2 - 12, 7, 24, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.accent);
  doc.setFontSize(4);
  doc.text("CARTE D'ÉTUDIANT", width / 2, 9.3, { align: "center" });

  // Ligne institution
  doc.setFillColor(240, 244, 248);
  doc.rect(0, 11, width, 5, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(3.2);
  doc.text(institution.nom.substring(0, 60), width / 2, 14, { align: "center" });

  // Photo
  if (student.photo) {
    try {
      doc.addImage(student.photo, "JPEG", 4, 18, 18, 22);
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.3);
      doc.rect(4, 18, 18, 22);
    } catch (e) {}
  }

  // Informations
  const infoX = 26;
  let infoY = 20;
  const grayLight: [number, number, number] = [107, 114, 128];

  doc.setTextColor(...grayLight);
  doc.setFontSize(2.8);
  doc.setFont("helvetica", "normal");
  doc.text("Noms", infoX, infoY);

  doc.setTextColor(...colors.accent);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  infoY += 3;
  doc.text(`${student.nom} ${student.prenom}`, infoX, infoY);

  infoY += 5;
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.8);
  doc.setFont("helvetica", "normal");
  doc.text("Faculté", infoX, infoY);

  doc.setTextColor(...colors.accent);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  infoY += 3;
  doc.text(student.faculte, infoX, infoY);

  infoY += 5;
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.8);
  doc.setFont("helvetica", "normal");
  doc.text("Promotion", infoX, infoY);
  doc.text("Année", infoX + 20, infoY);

  doc.setTextColor(...colors.accent);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  infoY += 3;
  doc.text(student.promotion, infoX, infoY);
  doc.text(student.anneeAcademique, infoX + 20, infoY);

  // QR Code (si pas au verso)
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", width - 18, 18, 14, 14);
    } catch (e) {}
  }

  // Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, height - 10, width, 10, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.1);
  doc.line(0, height - 10, width, height - 10);

  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text(institution.mentionSignature, 6, height - 6);

  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.text("Date d'expiration", width - 22, height - 6);
  doc.setTextColor(...colors.primary);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 22, height - 2.5);
};

// ===== RECTO MODERNE =====
const renderModernRecto = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number] },
  width: number,
  height: number,
  qrDataUrl: string,
  qrOnVerso: boolean
) => {
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, width, height, "F");

  // En-tête
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, width, 9, "F");

  const logo = institution.logoGauche || institution.logoDroite;
  if (logo) {
    try {
      doc.addImage(logo, "PNG", 3, 1.5, 6, 6);
    } catch (e) {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text(institution.nom.substring(0, 50), 11, 4);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text(institution.tutelle.substring(0, 60), 11, 7);

  // Badge
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 18, 10, 14, 4, 1, 1, "F");
  doc.setTextColor(...colors.accent);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text("ÉTUDIANT", width - 11, 12.7, { align: "center" });

  // Photo
  if (student.photo) {
    try {
      doc.addImage(student.photo, "JPEG", 5, 14, 18, 22);
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.5);
      doc.roundedRect(5, 14, 18, 22, 1, 1);
    } catch (e) {}
  }

  // Infos
  const infoX = 27;
  let infoY = 16;

  doc.setTextColor(...colors.primary);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text(student.nom, infoX, infoY);
  infoY += 3.5;
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "normal");
  doc.text(student.prenom, infoX, infoY);

  infoY += 5;
  const grayLight: [number, number, number] = [107, 114, 128];
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.text("Faculté", infoX, infoY);
  doc.setTextColor(...colors.accent);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.faculte, infoX + 12, infoY);

  infoY += 3.5;
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Promo", infoX, infoY);
  doc.setTextColor(...colors.accent);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.promotion, infoX + 12, infoY);

  infoY += 3.5;
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Année", infoX, infoY);
  doc.setTextColor(...colors.accent);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.anneeAcademique, infoX + 12, infoY);

  // QR
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", width - 17, 18, 12, 12);
    } catch (e) {}
  }

  // Footer
  doc.setFillColor(255, 255, 255);
  doc.rect(0, height - 6, width, 6, "F");
  doc.setDrawColor(226, 232, 240);
  doc.line(0, height - 6, width, height - 6);

  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.text(institution.mentionSignature, 5, height - 2.5);
  doc.setTextColor(...colors.primary);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(`Exp: ${student.dateExpiration}`, width - 5, height - 2.5, { align: "right" });
};

// ===== RECTO AVANCÉ =====
const renderAdvancedRecto = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number] },
  width: number,
  height: number,
  qrDataUrl: string,
  qrOnVerso: boolean
) => {
  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, width, height, "F");

  // En-tête dégradé
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, width, 10, "F");

  // Logos
  if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", 2, 1, 8, 8);
    } catch (e) {}
  }
  if (institution.logoDroite) {
    try {
      doc.addImage(institution.logoDroite, "PNG", width - 10, 1, 8, 8);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", width - 10, 1, 8, 8);
    } catch (e) {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text(institution.tutelle.split("–")[0]?.trim() || "", width / 2, 3.5, { align: "center" });

  // Badge stylisé
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(width / 2 - 14, 5.5, 28, 4, 1, 1, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(4.5);
  doc.text("CARTE D'ÉTUDIANT", width / 2, 8.2, { align: "center" });

  // Nom institution
  doc.setFillColor(240, 245, 255);
  doc.rect(0, 10, width, 4.5, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(3);
  doc.text(institution.nom.substring(0, 55), width / 2, 12.8, { align: "center" });

  // Photo avec cadre
  if (student.photo) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(3.5, 16.5, 19, 23, 1, 1, "F");
      doc.addImage(student.photo, "JPEG", 4, 17, 18, 22);
    } catch (e) {}
  }

  // Infos stylisées
  const infoX = 26;
  let infoY = 18;
  const grayLight: [number, number, number] = [107, 114, 128];

  // Nom avec fond
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(infoX - 1, infoY - 2.5, 35, 7, 0.5, 0.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("NOMS", infoX, infoY);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(`${student.nom} ${student.prenom}`.substring(0, 25), infoX, infoY + 3.5);

  infoY += 10;
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Faculté", infoX, infoY);
  doc.setTextColor(...colors.accent);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.faculte, infoX, infoY + 3);

  infoY += 7;
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Promotion", infoX, infoY);
  doc.text("Année", infoX + 18, infoY);
  doc.setTextColor(...colors.accent);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.promotion, infoX, infoY + 3);
  doc.text(student.anneeAcademique, infoX + 18, infoY + 3);

  // QR avec effet
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(width - 17.5, 17.5, 13, 13, 1, 1, "F");
      doc.addImage(qrDataUrl, "PNG", width - 17, 18, 12, 12);
    } catch (e) {}
  }

  // Footer
  doc.setFillColor(240, 245, 255);
  doc.rect(0, height - 8, width, 8, "F");

  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.text(institution.mentionSignature, 5, height - 5);

  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Expiration", width - 20, height - 5);
  doc.setTextColor(...colors.primary);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 20, height - 1.5);
};

// ===== RECTO PREMIUM =====
const renderPremiumRecto = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number] },
  width: number,
  height: number,
  qrDataUrl: string,
  qrOnVerso: boolean
) => {
  // Fond sombre premium
  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, width, height, "F");

  // Bande dorée supérieure
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 0, width, 1, "F");

  // En-tête
  doc.setFillColor(...colors.primary);
  doc.rect(0, 1, width, 12, "F");

  // Logos avec bordure dorée
  if (institution.logoGauche) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.circle(7, 7.5, 5.5, "F");
      doc.addImage(institution.logoGauche, "PNG", 2.5, 3, 9, 9);
    } catch (e) {}
  }
  if (institution.logoDroite) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.circle(width - 7, 7.5, 5.5, "F");
      doc.addImage(institution.logoDroite, "PNG", width - 11.5, 3, 9, 9);
    } catch (e) {}
  } else if (institution.logoGauche) {
    try {
      doc.setFillColor(...colors.secondary);
      doc.circle(width - 7, 7.5, 5.5, "F");
      doc.addImage(institution.logoGauche, "PNG", width - 11.5, 3, 9, 9);
    } catch (e) {}
  }

  // Texte en-tête - République
  doc.setTextColor(...colors.primary);
  doc.setFontSize(3);
  doc.setFont("helvetica", "bold");
  doc.text("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", width / 2, 4, { align: "center" });

  // Sous-titre tutelle
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width / 2 - 28, 5, 56, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "bold");
  doc.text("ENSEIGNEMENT SUPÉRIEUR ET UNIVERSITAIRE", width / 2, 7.2, { align: "center" });

  // Badge CARTE D'ÉTUDIANT
  doc.setFillColor(...colors.primary);
  doc.roundedRect(width / 2 - 16, 9.5, 32, 4, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 12.2, { align: "center" });

  // Nom de l'institution
  doc.setTextColor(...colors.primary);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.nom.substring(0, 40), width / 2, 17, { align: "center" });

  // Photo avec cadre
  if (student.photo) {
    try {
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.5);
      doc.rect(4, 19, 18, 22);
      doc.addImage(student.photo, "JPEG", 4.5, 19.5, 17, 21);
    } catch (e) {}
  }

  // Informations avec bandes jaunes - disposition comme l'image de référence
  const infoX = 25;
  let infoY = 20;

  // Label NOMS (petit label jaune)
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 1.5, 8, 2.5, 0.3, 0.3, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(2.2);
  doc.setFont("helvetica", "bold");
  doc.text("Noms", infoX + 0.8, infoY);

  // Valeur NOMS (grande et en gras)
  doc.setTextColor(...colors.primary);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(`${student.nom} ${student.prenom}`, infoX, infoY + 4);

  infoY += 8;

  // Label FACULTÉ (petit label jaune)
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 1.5, 10, 2.5, 0.3, 0.3, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(2.2);
  doc.setFont("helvetica", "bold");
  doc.text("Faculté", infoX + 0.8, infoY);

  // Valeur FACULTÉ
  doc.setTextColor(...colors.primary);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text(student.faculte, infoX, infoY + 4);

  infoY += 8;

  // Labels PROMOTION et ANNÉE côte à côte
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX, infoY - 1.5, 14, 2.5, 0.3, 0.3, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(2.2);
  doc.setFont("helvetica", "bold");
  doc.text("Promotion", infoX + 0.8, infoY);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(infoX + 20, infoY - 1.5, 10, 2.5, 0.3, 0.3, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(2.2);
  doc.setFont("helvetica", "bold");
  doc.text("Année", infoX + 20.8, infoY);

  // Valeurs PROMOTION et ANNÉE
  doc.setTextColor(...colors.primary);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text(student.promotion, infoX, infoY + 4);
  doc.text(student.anneeAcademique, infoX + 20, infoY + 4);

  // QR Code à droite
  if (!qrOnVerso && qrDataUrl) {
    try {
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.3);
      doc.rect(width - 18, 19, 14, 14);
      doc.addImage(qrDataUrl, "PNG", width - 17.5, 19.5, 13, 13);
    } catch (e) {}
  }

  // Footer
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, height - 7, width, 7, "F");

  // Signature à gauche
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(2);
  doc.setFont("helvetica", "normal");
  doc.text("Chef de l'établissement", 4, height - 4.5);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "bold");
  doc.text(institution.mentionSignature, 4, height - 2);

  // DATE EXPIRATION à droite
  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 28, height - 6, 8, 2.5, 0.3, 0.3, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(2);
  doc.setFont("helvetica", "bold");
  doc.text("DATE", width - 27.5, height - 4.2);

  doc.setFillColor(...colors.secondary);
  doc.roundedRect(width - 19, height - 6, 15, 2.5, 0.3, 0.3, "F");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(2);
  doc.setFont("helvetica", "bold");
  doc.text("EXPIRATION", width - 18.5, height - 4.2);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 20, height - 1);

  // Bande dorée inférieure
  doc.setFillColor(...colors.secondary);
  doc.rect(0, height - 0.5, width, 0.5, "F");
};
