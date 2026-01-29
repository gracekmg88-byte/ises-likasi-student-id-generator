import { useEffect, useState } from "react";
import { Student, Institution, CardTemplate } from "@/types/student";
import QRCode from "qrcode";

interface StudentCardProps {
  student: Student;
  institution: Institution;
  template: CardTemplate;
  size?: "preview" | "full";
}

const StudentCard = ({ student, institution, template, size = "preview" }: StudentCardProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const generateQR = async () => {
      // Si QR personnalisé, l'utiliser
      if (student.customQrCode) {
        setQrCodeUrl(student.customQrCode);
        return;
      }

      try {
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
  }, [student.qrCodeData, student.customQrCode]);

  // Render selon le template
  const renderCard = () => {
    switch (template.style) {
      case "modern":
        return renderModernCard();
      case "advanced":
        return renderAdvancedCard();
      default:
        return renderClassicCard();
    }
  };

  // Template Classique
  const renderClassicCard = () => (
    <div className="relative h-full bg-gradient-to-br from-primary/5 via-card to-secondary/10 rounded-lg shadow-2xl border-4 border-primary overflow-hidden">
      {/* En-tête officiel */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-1.5 px-3">
        <div className="flex items-center justify-between">
          {/* Logo Gauche */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
            {institution.logoGauche ? (
              <img src={institution.logoGauche} alt="Logo" className="w-full h-full object-contain p-0.5" />
            ) : (
              <div className="text-[6px] text-center leading-tight font-bold">RDC</div>
            )}
          </div>
          
          <div className="text-center flex-1 px-2">
            <p className="text-[6px] font-bold tracking-wider uppercase leading-tight">
              {institution.tutelle.split("–")[0]}
            </p>
            <p className="text-[5px] font-semibold text-secondary">
              {institution.tutelle.split("–")[1] || "Enseignement Supérieur"}
            </p>
            <p className="text-[8px] font-bold tracking-wide mt-0.5 bg-secondary text-secondary-foreground px-2 py-0.5 inline-block rounded-sm">
              CARTE D'ÉTUDIANT
            </p>
          </div>
          
          {/* Logo Droite */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-secondary">
            {institution.logoDroite ? (
              <img src={institution.logoDroite} alt="Logo" className="w-full h-full object-contain p-0.5" />
            ) : institution.logoGauche ? (
              <img src={institution.logoGauche} alt="Logo" className="w-full h-full object-contain p-0.5" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[5px] font-bold text-primary">LOGO</div>
            )}
          </div>
        </div>
      </div>

      {/* Nom institution */}
      <div className="bg-primary/10 py-1 text-center border-y border-primary/20">
        <p className="text-[9px] font-bold text-primary uppercase tracking-wide px-2 leading-tight">
          {institution.nom}
        </p>
      </div>

      {/* Contenu principal */}
      <div className="flex gap-3 p-3">
        {/* Photo */}
        <div className="flex-shrink-0">
          <div className="w-20 h-24 rounded border-2 border-primary/30 overflow-hidden bg-muted shadow-md">
            {student.photo ? (
              <img src={student.photo} alt={`${student.prenom} ${student.nom}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Photo</div>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="flex-1 min-w-0 text-[10px] space-y-1.5">
          <div>
            <span className="text-muted-foreground text-[8px] uppercase">Noms</span>
            <p className="font-bold text-sm text-foreground truncate">{student.nom} {student.prenom}</p>
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
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
            </div>
          )}
        </div>
      </div>

      {/* Pied de page */}
      <div className="absolute bottom-0 left-0 right-0 bg-primary/5 border-t border-primary/20 py-1.5 px-3">
        <div className="flex justify-between items-end">
          <div className="text-[8px]">
            <p className="text-muted-foreground">{institution.mentionSignature}</p>
            <div className="w-16 border-t border-dashed border-primary/40 mt-3 pt-0.5">
              <p className="text-muted-foreground italic">Signature</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-muted-foreground">Date d'expiration</p>
            <p className="text-xs font-bold text-primary">{student.dateExpiration}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Template Moderne
  const renderModernCard = () => (
    <div className="relative h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-xl border border-slate-200 overflow-hidden">
      {/* En-tête minimaliste */}
      <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground py-2 px-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/90 shadow-sm">
            {(institution.logoGauche || institution.logoDroite) ? (
              <img src={institution.logoGauche || institution.logoDroite} alt="Logo" className="w-full h-full object-contain p-0.5" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[5px] font-bold text-primary">LOGO</div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-wide uppercase">{institution.nom}</p>
            <p className="text-[7px] opacity-80">{institution.tutelle}</p>
          </div>
        </div>
      </div>

      {/* Badge carte */}
      <div className="absolute top-12 right-3 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-[7px] font-bold shadow-sm">
        ÉTUDIANT
      </div>

      {/* Contenu */}
      <div className="flex gap-4 p-4 pt-5">
        {/* Photo avec effet */}
        <div className="flex-shrink-0">
          <div className="w-20 h-24 rounded-xl overflow-hidden bg-white shadow-lg ring-2 ring-primary/20">
            {student.photo ? (
              <img src={student.photo} alt={`${student.prenom} ${student.nom}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Photo</div>
            )}
          </div>
        </div>

        {/* Infos avec style moderne */}
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <p className="font-bold text-base text-primary truncate">{student.nom}</p>
            <p className="font-medium text-sm text-foreground/80">{student.prenom}</p>
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-12 text-muted-foreground">Faculté</span>
              <span className="font-medium">{student.faculte}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 text-muted-foreground">Promo</span>
              <span className="font-medium">{student.promotion}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 text-muted-foreground">Année</span>
              <span className="font-medium">{student.anneeAcademique}</span>
            </div>
          </div>
        </div>

        {/* QR */}
        <div className="flex-shrink-0">
          {qrCodeUrl && (
            <div className="w-14 h-14 bg-white rounded-lg shadow-md p-1">
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
            </div>
          )}
        </div>
      </div>

      {/* Footer minimaliste */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 py-1.5 px-4">
        <div className="flex justify-between items-center text-[8px]">
          <span className="text-muted-foreground">{institution.mentionSignature}</span>
          <span className="font-semibold text-primary">Exp: {student.dateExpiration}</span>
        </div>
      </div>
    </div>
  );

  // Template Avancé
  const renderAdvancedCard = () => (
    <div className="relative h-full bg-gradient-to-br from-primary/20 via-background to-secondary/20 rounded-2xl shadow-2xl border-2 border-primary/30 overflow-hidden">
      {/* Motif décoratif */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/30 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-tr-full" />

      {/* En-tête avec dégradé */}
      <div className="relative bg-gradient-to-r from-primary via-primary/90 to-secondary/80 text-primary-foreground py-2 px-3">
        <div className="flex items-center justify-between">
          {/* Logo Gauche */}
          <div className="w-9 h-9 rounded-full overflow-hidden bg-white shadow-lg ring-2 ring-white/50">
            {institution.logoGauche ? (
              <img src={institution.logoGauche} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[5px] font-bold text-primary">RDC</div>
            )}
          </div>
          
          <div className="text-center flex-1 px-2">
            <p className="text-[6px] font-bold tracking-wider uppercase drop-shadow-sm">
              {institution.tutelle.split("–")[0]}
            </p>
            <div className="inline-block mt-0.5 bg-white/20 backdrop-blur-sm px-3 py-0.5 rounded-full">
              <p className="text-[9px] font-black tracking-wide">CARTE D'ÉTUDIANT</p>
            </div>
          </div>
          
          {/* Logo Droite */}
          <div className="w-9 h-9 rounded-full overflow-hidden bg-white shadow-lg ring-2 ring-secondary/50">
            {institution.logoDroite ? (
              <img src={institution.logoDroite} alt="Logo" className="w-full h-full object-contain" />
            ) : institution.logoGauche ? (
              <img src={institution.logoGauche} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[5px] font-bold text-primary">LOGO</div>
            )}
          </div>
        </div>
      </div>

      {/* Nom institution */}
      <div className="relative py-1 text-center bg-gradient-to-r from-transparent via-primary/10 to-transparent">
        <p className="text-[9px] font-bold text-primary uppercase tracking-wide px-2">
          {institution.nom}
        </p>
      </div>

      {/* Contenu avec style avancé */}
      <div className="relative flex gap-3 p-3">
        {/* Photo avec cadre stylisé */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary to-secondary rounded-xl opacity-50 blur-sm" />
            <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-white shadow-xl">
              {student.photo ? (
                <img src={student.photo} alt={`${student.prenom} ${student.nom}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Photo</div>
              )}
            </div>
          </div>
        </div>

        {/* Informations avec style */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-lg px-2 py-1">
            <p className="text-[8px] text-primary/70 uppercase tracking-wide">Noms</p>
            <p className="font-bold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
              {student.nom} {student.prenom}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px]">
            <div>
              <p className="text-muted-foreground text-[7px] uppercase">Faculté</p>
              <p className="font-semibold text-foreground">{student.faculte}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[7px] uppercase">Promotion</p>
              <p className="font-semibold text-foreground">{student.promotion}</p>
            </div>
          </div>
          <div className="text-[9px]">
            <p className="text-muted-foreground text-[7px] uppercase">Année académique</p>
            <p className="font-semibold text-foreground">{student.anneeAcademique}</p>
          </div>
        </div>

        {/* QR Code stylisé */}
        <div className="flex-shrink-0">
          {qrCodeUrl && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary to-secondary rounded-lg opacity-30 blur-sm" />
              <div className="relative w-14 h-14 bg-white rounded-lg shadow-lg p-1">
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer stylisé */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/10 to-transparent py-2 px-3">
        <div className="flex justify-between items-end">
          <div className="text-[7px]">
            <p className="text-primary/70">{institution.mentionSignature}</p>
            <div className="w-14 border-t border-primary/40 mt-2 pt-0.5">
              <p className="text-muted-foreground italic text-[6px]">Signature</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[7px] text-muted-foreground">Expiration</p>
            <p className="text-[11px] font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {student.dateExpiration}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[400px] mx-auto" style={{ aspectRatio: "1.586 / 1" }}>
      {renderCard()}
    </div>
  );
};

export default StudentCard;
