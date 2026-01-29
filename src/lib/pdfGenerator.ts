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

  // Couleurs selon template
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

  // Fond
  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, width, height, "F");

  // Rendu selon template
  switch (template.style) {
    case "modern":
      await renderModernPDF(doc, student, institution, colors, width, height);
      break;
    case "advanced":
      await renderAdvancedPDF(doc, student, institution, colors, width, height);
      break;
    default:
      await renderClassicPDF(doc, student, institution, colors, width, height);
  }

  const fileName = `carte_${template.style}_${student.nom}_${student.prenom}.pdf`;
  doc.save(fileName);
};

// Template Classique PDF
const renderClassicPDF = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number] },
  width: number,
  height: number
) => {
  // En-tête bleu
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, width, 11, "F");

  // Logo gauche
  if (institution.logoGauche) {
    try {
      doc.addImage(institution.logoGauche, "PNG", 2, 1, 9, 9);
    } catch (e) {}
  }

  // Logo droite
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

  // QR Code
  try {
    let qrDataUrl: string;
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
    doc.addImage(qrDataUrl, "PNG", width - 18, 18, 14, 14);
  } catch (e) {}

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
  doc.setDrawColor(156, 163, 175);
  doc.line(4, height - 3, 25, height - 3);
  doc.setFontSize(2);
  doc.setFont("helvetica", "italic");
  doc.text("Signature", 6, height - 1.5);

  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.text("Date d'expiration", width - 22, height - 6);
  doc.setTextColor(...colors.primary);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 22, height - 2.5);
};

// Template Moderne PDF
const renderModernPDF = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number] },
  width: number,
  height: number
) => {
  // Fond dégradé simulé
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, width, height, "F");

  // En-tête
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, width, 9, "F");

  // Logo
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
  try {
    let qrDataUrl: string;
    if (student.customQrCode) {
      qrDataUrl = student.customQrCode;
    } else {
      const verificationUrl = `${window.location.origin}/verification/${student.qrCodeData}`;
      qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 1,
        color: { dark: "#334155", light: "#ffffff" },
      });
    }
    doc.addImage(qrDataUrl, "PNG", width - 17, 18, 12, 12);
  } catch (e) {}

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

// Template Avancé PDF
const renderAdvancedPDF = async (
  doc: jsPDF,
  student: Student,
  institution: Institution,
  colors: { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number]; bg: [number, number, number] },
  width: number,
  height: number
) => {
  // Fond avec effet
  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, width, height, "F");

  // Décoration
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.circle(width + 5, -5, 20, "F");

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

  // Texte en-tête
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
  try {
    let qrDataUrl: string;
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
    doc.setFillColor(...colors.secondary);
    doc.roundedRect(width - 17.5, 17.5, 13, 13, 1, 1, "F");
    doc.addImage(qrDataUrl, "PNG", width - 17, 18, 12, 12);
  } catch (e) {}

  // Footer
  doc.setFillColor(240, 245, 255);
  doc.rect(0, height - 8, width, 8, "F");

  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.text(institution.mentionSignature, 5, height - 5);
  doc.setDrawColor(...colors.primary);
  doc.line(4, height - 2.5, 22, height - 2.5);
  doc.setFontSize(2);
  doc.setFont("helvetica", "italic");
  doc.text("Signature", 5, height - 1);

  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Expiration", width - 20, height - 5);
  doc.setTextColor(...colors.primary);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 20, height - 1.5);
};

export const getImageBase64 = async (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      } else {
        reject(new Error("Could not get canvas context"));
      }
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};
