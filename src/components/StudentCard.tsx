import { useEffect, useState } from "react";
import { Student, Institution, CardTemplate } from "@/types/student";
import QRCode from "qrcode";

interface StudentCardProps {
  student: Student;
  institution: Institution;
  template: CardTemplate;
  side?: "recto" | "verso";
}

const StudentCard = ({ student, institution, template, side = "recto" }: StudentCardProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const generateQR = async () => {
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

  const qrOnVerso = student.qrPosition === "verso";

  const renderCard = () => {
    if (side === "verso") {
      return renderVerso();
    }
    
    switch (template.style) {
      case "modern":
        return renderModernRecto();
      case "advanced":
        return renderAdvancedRecto();
      case "premium":
        return renderPremiumRecto();
      default:
        return renderClassicRecto();
    }
  };

  // ===== VERSO COMMUN =====
  const renderVerso = () => (
    <div className="relative h-full bg-gradient-to-br from-primary/10 via-card to-secondary/5 rounded-lg shadow-2xl border-4 border-primary overflow-hidden">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-2 px-3">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
            {institution.logoGauche ? (
              <img src={institution.logoGauche} alt="Logo" className="w-full h-full object-contain p-0.5" />
            ) : (
              <div className="text-[5px] text-center font-bold">RDC</div>
            )}
          </div>
          <div className="text-center flex-1 px-2">
            <p className="text-[7px] font-bold tracking-wider uppercase">CARTE D'ÉTUDIANT</p>
            <p className="text-[5px] text-secondary">{institution.nom}</p>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-secondary">
            {institution.logoDroite ? (
              <img src={institution.logoDroite} alt="Logo" className="w-full h-full object-contain p-0.5" />
            ) : institution.logoGauche ? (
              <img src={institution.logoGauche} alt="Logo" className="w-full h-full object-contain p-0.5" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[4px] font-bold text-primary">LOGO</div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu Verso */}
      <div className="p-3 space-y-2">
        {/* QR Code au verso si configuré */}
        {qrOnVerso && qrCodeUrl && (
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-white rounded-lg border-2 border-primary/20 p-1 shadow-md">
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Texte officiel */}
        <div className="text-center space-y-1.5">
          <p className="text-[7px] text-muted-foreground leading-tight">
            {institution.texteVerso || 
              "Cette carte est strictement personnelle et non transférable. Elle est valide uniquement pour l'année académique en cours. En cas de perte, prière de la retourner à l'établissement."}
          </p>
        </div>

        {/* Zone signature et cachet */}
        <div className="flex justify-between items-end mt-3 pt-2 border-t border-primary/20">
          <div className="text-center">
            <div className="w-16 h-12 border border-dashed border-primary/30 rounded flex items-center justify-center mb-1 bg-white/50">
              {institution.cachetImage ? (
                <img src={institution.cachetImage} alt="Cachet" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-[6px] text-muted-foreground">Cachet</span>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-10 flex items-end justify-center">
              {institution.signatureImage ? (
                <img src={institution.signatureImage} alt="Signature" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="w-full border-t border-primary/50"></div>
              )}
            </div>
            <p className="text-[7px] font-medium text-primary mt-1">{institution.mentionSignature}</p>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="absolute bottom-0 left-0 right-0 bg-primary/5 border-t border-primary/20 py-1 px-3">
        <p className="text-[6px] text-center text-muted-foreground">
          Vérifiez l'authenticité : scannez le QR Code ou visitez notre portail de vérification
        </p>
      </div>
    </div>
  );

  // ===== RECTO CLASSIQUE =====
  const renderClassicRecto = () => (
    <div className="relative h-full bg-gradient-to-br from-primary/5 via-card to-secondary/10 rounded-lg shadow-2xl border-4 border-primary overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-1.5 px-3">
        <div className="flex items-center justify-between">
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
            <p className="text-[6px] font-semibold text-[#f5c538]">
              {institution.tutelle.split("–")[1] || "Enseignement Supérieur"}
            </p>
            <p className="text-[8px] font-bold tracking-wide mt-0.5 bg-[#f5c538] text-[#0f172a] px-2 py-0.5 inline-block rounded-sm">
              CARTE D'ÉTUDIANT
            </p>
          </div>
          
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

      <div className="bg-primary/10 py-1 text-center border-y border-primary/20">
        <p className="text-[9px] font-bold text-primary uppercase tracking-wide px-2 leading-tight">
          {institution.nom}
        </p>
      </div>

      <div className="flex gap-3 p-3">
        <div className="flex-shrink-0">
          <div className="w-20 h-24 rounded border-2 border-primary/30 overflow-hidden bg-muted shadow-md">
            {student.photo ? (
              <img src={student.photo} alt={`${student.prenom} ${student.nom}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Photo</div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 text-[10px] space-y-1.5">
          <div>
            <span className="bg-[#f5c538] text-[#0f172a] text-[7px] px-1.5 py-0.5 rounded font-bold uppercase">Noms</span>
            <p className="font-bold text-sm text-foreground mt-0.5">{student.nom} {student.prenom}</p>
          </div>
          <div>
            <span className="bg-[#f5c538] text-[#0f172a] text-[7px] px-1.5 py-0.5 rounded font-bold uppercase">Faculté</span>
            <p className="font-semibold text-foreground text-[10px] mt-0.5 leading-tight">{student.faculte}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <span className="bg-[#f5c538] text-[#0f172a] text-[7px] px-1.5 py-0.5 rounded font-bold uppercase">Promotion</span>
              <p className="font-semibold text-foreground mt-0.5">{student.promotion}</p>
            </div>
            <div>
              <span className="bg-[#f5c538] text-[#0f172a] text-[7px] px-1.5 py-0.5 rounded font-bold uppercase">Année</span>
              <p className="font-semibold text-foreground mt-0.5">{student.anneeAcademique}</p>
            </div>
          </div>
        </div>

        {!qrOnVerso && qrCodeUrl && (
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded border border-primary/20 p-1 shadow-sm">
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-primary/5 border-t border-primary/20 py-1.5 px-3">
        <div className="flex justify-between items-center">
          <div>
            <span className="bg-[#f5c538] text-[#0f172a] text-[7px] px-1.5 py-0.5 rounded font-bold uppercase">{institution.mentionSignature}</span>
          </div>
          <div className="text-right">
            <span className="bg-[#f5c538] text-[#0f172a] text-[7px] px-1.5 py-0.5 rounded font-bold uppercase">Expire le</span>
            <p className="text-xs font-bold text-primary mt-0.5">{student.dateExpiration}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== RECTO MODERNE =====
  const renderModernRecto = () => (
    <div className="relative h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground py-2 px-4">
        <div className="flex items-center gap-3">
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

      <div className="absolute top-12 right-3 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-[7px] font-bold shadow-sm">
        ÉTUDIANT
      </div>

      <div className="flex gap-4 p-4 pt-5">
        <div className="flex-shrink-0">
          <div className="w-20 h-24 rounded-xl overflow-hidden bg-white shadow-lg ring-2 ring-primary/20">
            {student.photo ? (
              <img src={student.photo} alt={`${student.prenom} ${student.nom}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Photo</div>
            )}
          </div>
        </div>

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

        {!qrOnVerso && qrCodeUrl && (
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-white rounded-lg shadow-md p-1">
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 py-1.5 px-4">
        <div className="flex justify-between items-center text-[8px]">
          <span className="text-muted-foreground">{institution.mentionSignature}</span>
          <span className="font-semibold text-primary">Exp: {student.dateExpiration}</span>
        </div>
      </div>
    </div>
  );

  // ===== RECTO AVANCÉ =====
  const renderAdvancedRecto = () => (
    <div className="relative h-full bg-gradient-to-br from-primary/20 via-background to-secondary/20 rounded-2xl shadow-2xl border-2 border-primary/30 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/30 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-tr-full" />

      <div className="relative bg-gradient-to-r from-primary via-primary/90 to-secondary/80 text-primary-foreground py-2 px-3">
        <div className="flex items-center justify-between">
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

      <div className="relative py-1 text-center bg-gradient-to-r from-transparent via-primary/10 to-transparent">
        <p className="text-[9px] font-bold text-primary uppercase tracking-wide px-2">
          {institution.nom}
        </p>
      </div>

      <div className="relative flex gap-3 p-3">
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

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-lg px-2 py-1">
            <p className="text-[8px] text-primary/70 uppercase tracking-wide">Noms</p>
            <p className="font-bold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
              {student.nom} {student.prenom}
            </p>
          </div>
          
          {/* Matricule - uniquement pour le modèle Advanced */}
          {student.matricule && (
            <div className="bg-gradient-to-r from-secondary/20 to-transparent rounded-lg px-2 py-0.5">
              <p className="text-[7px] text-secondary uppercase tracking-wide font-bold">Matricule</p>
              <p className="font-bold text-[10px] text-foreground">{student.matricule}</p>
            </div>
          )}
          
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

        {!qrOnVerso && qrCodeUrl && (
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary to-secondary rounded-lg opacity-30 blur-sm" />
              <div className="relative w-14 h-14 bg-white rounded-lg shadow-lg p-1">
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/10 to-transparent py-2 px-3">
        <div className="flex justify-between items-end">
          <div className="text-[7px]">
            <p className="text-primary/70">{institution.mentionSignature}</p>
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

  // ===== RECTO PREMIUM =====
  const renderPremiumRecto = () => (
    <div className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-primary/90 rounded-xl shadow-2xl border-2 border-secondary/50 overflow-hidden">
      {/* Motifs décoratifs */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(234,179,8,0.3),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(234,179,8,0.2),transparent_50%)]" />
      </div>

      {/* Bande dorée supérieure */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-secondary/80 to-secondary" />

      <div className="relative pt-2 px-3">
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-white shadow-lg ring-2 ring-secondary/70">
            {institution.logoGauche ? (
              <img src={institution.logoGauche} alt="Logo" className="w-full h-full object-contain p-0.5" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[6px] font-bold text-primary">RDC</div>
            )}
          </div>
          
          <div className="text-center flex-1 px-2">
            <p className="text-[5px] font-medium tracking-widest uppercase text-secondary/80">
              {institution.tutelle.split("–")[0]}
            </p>
            <p className="text-[9px] font-bold tracking-wide text-white mt-0.5">
              {institution.nom}
            </p>
            <div className="inline-block mt-1 bg-gradient-to-r from-secondary to-secondary/80 px-4 py-1 rounded-full shadow-lg">
              <p className="text-[8px] font-black tracking-wider text-slate-900">CARTE D'ÉTUDIANT</p>
            </div>
          </div>
          
          <div className="w-11 h-11 rounded-full overflow-hidden bg-white shadow-lg ring-2 ring-secondary/70">
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

      <div className="relative flex gap-3 p-3 pt-2">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg" />
            <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-white shadow-xl border border-secondary/30">
              {student.photo ? (
                <img src={student.photo} alt={`${student.prenom} ${student.nom}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Photo</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Champ Noms avec bande */}
          <div className="bg-gradient-to-r from-secondary/90 to-secondary/70 rounded px-2 py-0.5 inline-block shadow-sm">
            <p className="text-[8px] font-bold text-slate-900 uppercase tracking-wide">Noms</p>
          </div>
          <div className="pl-1 -mt-0.5">
            <p className="font-bold text-sm text-white truncate leading-tight">{student.nom}</p>
            <p className="font-medium text-xs text-white/80">{student.prenom}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {/* Champ Faculté avec bande */}
            <div>
              <div className="bg-gradient-to-r from-secondary/90 to-secondary/70 rounded px-1.5 py-0.5 inline-block shadow-sm">
                <p className="text-[7px] font-bold text-slate-900 uppercase tracking-wide">Faculté</p>
              </div>
              <p className="font-semibold text-white/90 text-[9px] pl-0.5 mt-0.5 leading-tight">{student.faculte}</p>
            </div>
            
            {/* Champ Promotion avec bande */}
            <div>
              <div className="bg-gradient-to-r from-secondary/90 to-secondary/70 rounded px-1.5 py-0.5 inline-block shadow-sm">
                <p className="text-[7px] font-bold text-slate-900 uppercase tracking-wide">Promotion</p>
              </div>
              <p className="font-semibold text-white/90 text-[9px] pl-0.5 mt-0.5 leading-tight">{student.promotion}</p>
            </div>
            
            {/* Champ Année avec bande */}
            <div>
              <div className="bg-gradient-to-r from-secondary/90 to-secondary/70 rounded px-1.5 py-0.5 inline-block shadow-sm">
                <p className="text-[7px] font-bold text-slate-900 uppercase tracking-wide">Année</p>
              </div>
              <p className="font-semibold text-white/90 text-[9px] pl-0.5 mt-0.5 leading-tight">{student.anneeAcademique}</p>
            </div>
          </div>
        </div>

        {!qrOnVerso && qrCodeUrl && (
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg" />
              <div className="relative w-14 h-14 bg-white rounded-lg shadow-lg p-1">
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-2 px-3">
        <div className="flex justify-between items-end">
          {/* Mention signature avec bande */}
          <div>
            <div className="bg-gradient-to-r from-secondary/90 to-secondary/70 rounded px-1.5 py-0.5 inline-block shadow-sm mb-0.5">
              <p className="text-[6px] font-bold text-slate-900 uppercase tracking-wide">{institution.mentionSignature.split(' ')[0] || 'Recteur'}</p>
            </div>
            <p className="text-[7px] text-secondary/90 font-medium pl-0.5">{institution.mentionSignature}</p>
          </div>
          
          {/* Date expiration avec bande */}
          <div className="text-right">
            <div className="bg-gradient-to-r from-secondary/90 to-secondary/70 rounded px-1.5 py-0.5 inline-block shadow-sm mb-0.5">
              <p className="text-[6px] font-bold text-slate-900 uppercase tracking-wide">Expire le</p>
            </div>
            <p className="text-xs font-bold text-secondary pr-0.5">{student.dateExpiration}</p>
          </div>
        </div>
      </div>

      {/* Hologramme simulé */}
      <div className="absolute top-14 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-secondary/40 via-white/20 to-secondary/40 opacity-70" />
      
      {/* Bande dorée inférieure */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary via-secondary/80 to-secondary" />
    </div>
  );

  return (
    <div className="w-full max-w-[400px] mx-auto" style={{ aspectRatio: "1.586 / 1" }}>
      {renderCard()}
    </div>
  );
};

export default StudentCard;
