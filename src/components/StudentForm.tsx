import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addStudent } from "@/lib/studentStore";
import { Student } from "@/types/student";
import { Camera, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

interface StudentFormProps {
  onStudentAdded: (student: Student) => void;
}

const StudentForm = ({ onStudentAdded }: StudentFormProps) => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [photo, setPhoto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo ne doit pas dépasser 5 Mo");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nom.trim() || !prenom.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!photo) {
      toast.error("Veuillez ajouter une photo d'identité");
      return;
    }

    setIsLoading(true);

    try {
      const student = addStudent({
        nom: nom.trim().toUpperCase(),
        prenom: prenom.trim(),
        photo,
        faculte: "Gestion Informatique",
        promotion: "BAC 1",
        anneeAcademique: "2025–2026",
        dateExpiration: "12/2026",
      });

      onStudentAdded(student);
      toast.success("Étudiant enregistré avec succès !");
      
      // Reset form
      setNom("");
      setPrenom("");
      setPhoto("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = () => {
    setPhoto("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="card-institutional animate-fade-in">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-primary font-serif">
          <UserPlus className="h-5 w-5" />
          Nouvel Étudiant
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Photo d'identité <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-start gap-4">
              <div className="relative">
                {photo ? (
                  <div className="relative">
                    <img
                      src={photo}
                      alt="Photo étudiant"
                      className="w-28 h-36 object-cover rounded-lg border-2 border-primary/20 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-36 border-2 border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <Camera className="h-8 w-8 text-primary/40 mb-2" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Cliquez pour ajouter
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Format: JPG, PNG</p>
                <p>• Taille max: 5 Mo</p>
                <p>• Photo type passeport</p>
              </div>
            </div>
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="nom" className="text-sm font-medium">
              Nom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="input-institutional"
              placeholder="Ex: KABONGO"
              required
            />
          </div>

          {/* Prénom */}
          <div className="space-y-2">
            <Label htmlFor="prenom" className="text-sm font-medium">
              Prénom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="prenom"
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="input-institutional"
              placeholder="Ex: Jean-Pierre"
              required
            />
          </div>

          {/* Informations fixes (lecture seule) */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Informations académiques
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Faculté:</span>
                <p className="font-medium">Gestion Informatique</p>
              </div>
              <div>
                <span className="text-muted-foreground">Promotion:</span>
                <p className="font-medium">BAC 1</p>
              </div>
              <div>
                <span className="text-muted-foreground">Année académique:</span>
                <p className="font-medium">2025–2026</p>
              </div>
              <div>
                <span className="text-muted-foreground">Expiration:</span>
                <p className="font-medium">12/2026</p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full btn-institutional"
            disabled={isLoading}
          >
            {isLoading ? "Enregistrement..." : "Enregistrer l'étudiant"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentForm;
