import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Student } from "@/types/student";

export const generateStudentCardPDF = async (student: Student, logoBase64: string): Promise<void> => {
  // Créer un PDF au format carte (85.6 x 54 mm - format carte de crédit)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [85.6, 54],
  });

  const width = 85.6;
  const height = 54;

  // Couleurs
  const primaryBlue: [number, number, number] = [26, 54, 93];
  const goldYellow: [number, number, number] = [234, 179, 8];
  const textDark: [number, number, number] = [17, 24, 39];
  const grayLight: [number, number, number] = [107, 114, 128];

  // Fond avec léger dégradé
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, width, height, "F");

  // En-tête bleu
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, width, 11, "F");

  // Texte en-tête
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", width / 2, 3, { align: "center" });

  doc.setFontSize(3.5);
  doc.setTextColor(...goldYellow);
  doc.text("ENSEIGNEMENT SUPÉRIEUR ET UNIVERSITAIRE", width / 2, 5.5, { align: "center" });

  // Badge "CARTE D'ÉTUDIANT"
  doc.setFillColor(...goldYellow);
  doc.roundedRect(width / 2 - 15, 7, 30, 3.5, 0.5, 0.5, "F");
  doc.setTextColor(...textDark);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  doc.text("CARTE D'ÉTUDIANT", width / 2, 9.3, { align: "center" });

  // Ligne sous l'en-tête avec nom institution
  doc.setFillColor(240, 244, 248);
  doc.rect(0, 11, width, 5, "F");
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  doc.text("INSTITUT SUPÉRIEUR DES ÉTUDES SOCIALES (ISES-LIKASI)", width / 2, 14, { align: "center" });

  // Logo ISES (en haut à droite)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "JPEG", width - 14, 1, 12, 9);
    } catch (e) {
      console.error("Erreur ajout logo:", e);
    }
  }

  // Photo de l'étudiant
  if (student.photo) {
    try {
      doc.addImage(student.photo, "JPEG", 4, 18, 18, 22);
      // Cadre photo
      doc.setDrawColor(...primaryBlue);
      doc.setLineWidth(0.3);
      doc.rect(4, 18, 18, 22);
    } catch (e) {
      console.error("Erreur ajout photo:", e);
    }
  }

  // Informations étudiant
  const infoX = 26;
  let infoY = 20;

  doc.setTextColor(...grayLight);
  doc.setFontSize(2.8);
  doc.setFont("helvetica", "normal");
  doc.text("Noms", infoX, infoY);

  doc.setTextColor(...textDark);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  infoY += 3;
  doc.text(`${student.nom} ${student.prenom}`, infoX, infoY);

  infoY += 5;
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.8);
  doc.setFont("helvetica", "normal");
  doc.text("Faculté", infoX, infoY);

  doc.setTextColor(...textDark);
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

  doc.setTextColor(...textDark);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");
  infoY += 3;
  doc.text(student.promotion, infoX, infoY);
  doc.text(student.anneeAcademique, infoX + 20, infoY);

  // QR Code
  try {
    const verificationUrl = `${window.location.origin}/verification/${student.qrCodeData}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#1a365d", light: "#ffffff" },
    });
    doc.addImage(qrDataUrl, "PNG", width - 18, 18, 14, 14);
  } catch (e) {
    console.error("Erreur génération QR:", e);
  }

  // Pied de page
  doc.setFillColor(248, 250, 252);
  doc.rect(0, height - 10, width, 10, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.1);
  doc.line(0, height - 10, width, height - 10);

  // Signature DG
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Directeur Général", 6, height - 6);
  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.1);
  doc.line(4, height - 3, 25, height - 3);
  doc.setFontSize(2);
  doc.setFont("helvetica", "italic");
  doc.text("Signature", 6, height - 1.5);

  // Date d'expiration
  doc.setTextColor(...grayLight);
  doc.setFontSize(2.5);
  doc.setFont("helvetica", "normal");
  doc.text("Date d'expiration", width - 22, height - 6);
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text(student.dateExpiration, width - 22, height - 2.5);

  // Télécharger
  const fileName = `carte_etudiant_${student.nom}_${student.prenom}.pdf`;
  doc.save(fileName);
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
