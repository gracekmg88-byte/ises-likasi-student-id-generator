import { useEffect, useState } from "react";
import { Student } from "@/types/student";
import QRCode from "qrcode";
import logoIses from "@/assets/logo-ises.jpg";

interface StudentCardProps {
  student: Student;
  size?: "preview" | "full";
}

const StudentCard = ({ student, size = "preview" }: StudentCardProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Le QR Code contient l'URL de vérification avec l'ID de l'étudiant
        const verificationUrl = `${window.location.origin}/verification/${student.qrCodeData}`;
        const url = await QRCode.toDataURL(verificationUrl, {
          width: 120,
          margin: 1,
          color: {
            dark: "#1a365d",
            light: "#ffffff",
          },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Erreur génération QR:", err);
      }
    };
    generateQR();
  }, [student.qrCodeData]);

  const cardScale = size === "preview" ? "scale-100" : "scale-100";

  return (
    <div
      className={`${cardScale} w-full max-w-[400px] mx-auto`}
      style={{ aspectRatio: "1.586 / 1" }}
    >
      <div className="relative h-full bg-gradient-to-br from-primary/5 via-card to-secondary/10 rounded-lg shadow-2xl border-4 border-primary overflow-hidden">
        {/* En-tête officiel */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-1.5 px-3">
          <div className="flex items-center justify-between">
            {/* Armoiries RDC (placeholder) */}
            <div className="w-8 h-10 bg-white/20 rounded flex items-center justify-center">
              <div className="text-[6px] text-center leading-tight font-bold">
                RDC
              </div>
            </div>
            
            <div className="text-center flex-1 px-2">
              <p className="text-[7px] font-bold tracking-wider uppercase">
                République Démocratique du Congo
              </p>
              <p className="text-[6px] font-semibold text-secondary">
                Enseignement Supérieur et Universitaire
              </p>
              <p className="text-[9px] font-bold tracking-wide mt-0.5 bg-secondary text-secondary-foreground px-2 py-0.5 inline-block rounded-sm">
                CARTE D'ÉTUDIANT
              </p>
            </div>
            
            {/* Logo ISES */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-secondary">
              <img
                src={logoIses}
                alt="Logo ISES-LIKASI"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
          </div>
        </div>

        {/* Nom institution */}
        <div className="bg-primary/10 py-1 text-center border-y border-primary/20">
          <p className="text-xs font-bold text-primary uppercase tracking-wide">
            Institut Supérieur des Études Sociales (ISES-LIKASI)
          </p>
        </div>

        {/* Contenu principal */}
        <div className="flex gap-3 p-3">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="w-20 h-24 rounded border-2 border-primary/30 overflow-hidden bg-muted shadow-md">
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={`${student.prenom} ${student.nom}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  Photo
                </div>
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="flex-1 min-w-0 text-[10px] space-y-1.5">
            <div>
              <span className="text-muted-foreground text-[8px] uppercase">Noms</span>
              <p className="font-bold text-sm text-foreground truncate">
                {student.nom} {student.prenom}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-[8px] uppercase">Faculté</span>
              <p className="font-semibold text-foreground">{student.faculte}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="text-muted-foreground text-[8px] uppercase">Promotion</span>
                <p className="font-semibold text-foreground">{student.promotion}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[8px] uppercase">Année</span>
                <p className="font-semibold text-foreground">{student.anneeAcademique}</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0 flex flex-col items-center">
            {qrCodeUrl && (
              <div className="w-16 h-16 bg-white rounded border border-primary/20 p-1 shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className="absolute bottom-0 left-0 right-0 bg-primary/5 border-t border-primary/20 py-1.5 px-3">
          <div className="flex justify-between items-end">
            <div className="text-[8px]">
              <p className="text-muted-foreground">Directeur Général</p>
              <div className="w-16 border-t border-dashed border-primary/40 mt-3 pt-0.5">
                <p className="text-muted-foreground italic">Signature</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-muted-foreground">
                Date d'expiration
              </p>
              <p className="text-xs font-bold text-primary">
                {student.dateExpiration}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
