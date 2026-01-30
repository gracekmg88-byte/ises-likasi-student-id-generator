import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addStudent } from "@/lib/studentStore";
import { Student } from "@/types/student";
import { getInstitutionById } from "@/lib/institutionStore";
import {
  UserPlus,
  Camera,
  Upload,
  X,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface StudentFormProps {
  onStudentAdded: (student: Student) => void;
  selectedInstitutionId: string;
}

const StudentForm = ({ onStudentAdded, selectedInstitutionId }: StudentFormProps) => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [matricule, setMatricule] = useState("");
  const [photo, setPhoto] = useState<string>("");
  const [faculte, setFaculte] = useState("Gestion Informatique");
  const [promotion, setPromotion] = useState("BAC 1");
  const [anneeAcademique, setAnneeAcademique] = useState("2025–2026");
  const [dateExpiration, setDateExpiration] = useState("12/2026");
  const [useCustomQr, setUseCustomQr] = useState(false);
  const [customQrCode, setCustomQrCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo est trop volumineuse (max 5 Mo)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Le fichier QR est trop volumineux (max 2 Mo)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomQrCode(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setNom("");
    setPrenom("");
    setMatricule("");
    setPhoto("");
    setFaculte("Gestion Informatique");
    setPromotion("BAC 1");
    setAnneeAcademique("2025–2026");
    setDateExpiration("12/2026");
    setUseCustomQr(false);
    setCustomQrCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom.trim() || !prenom.trim()) {
      toast.error("Veuillez remplir le nom et le prénom");
      return;
    }

    if (!photo) {
      toast.error("Veuillez ajouter une photo d'identité");
      return;
    }

    if (useCustomQr && !customQrCode) {
      toast.error("Veuillez uploader un QR Code ou désactiver l'option");
      return;
    }

    setIsSubmitting(true);

    try {
      const student = await addStudent({
        nom: nom.trim().toUpperCase(),
        prenom: prenom.trim(),
        matricule: matricule.trim() || undefined,
        photo,
        faculte: faculte.trim(),
        promotion: promotion.trim(),
        anneeAcademique: anneeAcademique.trim(),
        dateExpiration: dateExpiration.trim(),
        customQrCode: useCustomQr ? customQrCode : undefined,
        institutionId: selectedInstitutionId,
      });

      toast.success("Étudiant enregistré avec succès !");
      onStudentAdded(student);
      resetForm();
    } catch (error) {
      if (error instanceof Error && error.message.includes("QUOTA_EXCEEDED")) {
        toast.error("Espace de stockage plein ! Supprimez des étudiants existants pour continuer.");
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const institution = getInstitutionById(selectedInstitutionId);

  return (
    <Card className="card-institutional">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="text-xl font-serif text-primary flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Enregistrer un étudiant
        </CardTitle>
        {institution && (
          <p className="text-xs text-muted-foreground truncate">
            Institution: {institution.nom}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo */}
          <div className="space-y-2">
            <Label>Photo d'identité <span className="text-destructive">*</span></Label>
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-28 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden bg-muted/50 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => photoInputRef.current?.click()}
              >
                {photo ? (
                  <img
                    src={photo}
                    alt="Photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => photoInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choisir
                </Button>
                {photo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPhoto("")}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    Supprimer
                  </Button>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          {/* Nom et Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom <span className="text-destructive">*</span></Label>
              <Input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: MUKENDI"
                className="input-institutional"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom <span className="text-destructive">*</span></Label>
              <Input
                id="prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex: Jean"
                className="input-institutional"
                required
              />
            </div>
          </div>

          {/* Informations académiques */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              Informations académiques
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricule">Matricule <span className="text-muted-foreground text-xs">(Modèle 3)</span></Label>
                <Input
                  id="matricule"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  placeholder="Ex: 2025/KMG/001"
                  className="input-institutional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculte">Faculté / Option</Label>
                <Input
                  id="faculte"
                  value={faculte}
                  onChange={(e) => setFaculte(e.target.value)}
                  placeholder="Gestion Informatique"
                  className="input-institutional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotion">Promotion</Label>
                <Input
                  id="promotion"
                  value={promotion}
                  onChange={(e) => setPromotion(e.target.value)}
                  placeholder="BAC 1"
                  className="input-institutional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anneeAcademique">Année académique</Label>
                <Input
                  id="anneeAcademique"
                  value={anneeAcademique}
                  onChange={(e) => setAnneeAcademique(e.target.value)}
                  placeholder="2025–2026"
                  className="input-institutional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateExpiration">Date d'expiration</Label>
                <Input
                  id="dateExpiration"
                  value={dateExpiration}
                  onChange={(e) => setDateExpiration(e.target.value)}
                  placeholder="12/2026"
                  className="input-institutional"
                />
              </div>
            </div>
          </div>

          {/* QR Code personnalisé */}
          <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <Label htmlFor="customQr" className="text-sm font-medium">
                  QR Code personnalisé
                </Label>
              </div>
              <Switch
                id="customQr"
                checked={useCustomQr}
                onCheckedChange={setUseCustomQr}
              />
            </div>
            
            {useCustomQr ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden bg-white cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => qrInputRef.current?.click()}
                >
                  {customQrCode ? (
                    <img
                      src={customQrCode}
                      alt="QR Code"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <QrCode className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => qrInputRef.current?.click()}
                    className="gap-1 text-xs"
                  >
                    <Upload className="h-3 w-3" />
                    Uploader QR
                  </Button>
                  {customQrCode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomQrCode("")}
                      className="gap-1 text-xs text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                      Supprimer
                    </Button>
                  )}
                </div>
                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQrChange}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                QR Code généré automatiquement
              </p>
            )}
          </div>

          {/* Bouton submit */}
          <Button
            type="submit"
            className="w-full btn-institutional"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer l'étudiant"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentForm;
