import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Institution } from "@/types/student";
import {
  getInstitutions,
  addInstitution,
  updateInstitution,
  deleteInstitution,
} from "@/lib/institutionStore";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface InstitutionManagerProps {
  selectedInstitutionId: string;
  onSelectInstitution: (id: string) => void;
}

const InstitutionManager = ({
  selectedInstitutionId,
  onSelectInstitution,
}: InstitutionManagerProps) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  // Form state
  const [nom, setNom] = useState("");
  const [tutelle, setTutelle] = useState("");
  const [mentionSignature, setMentionSignature] = useState("");
  const [logoGauche, setLogoGauche] = useState<string>("");
  const [logoDroite, setLogoDroite] = useState<string>("");

  useEffect(() => {
    refreshInstitutions();
  }, []);

  const refreshInstitutions = () => {
    setInstitutions(getInstitutions());
  };

  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 2 Mo)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (side === "left") {
          setLogoGauche(base64);
        } else {
          setLogoDroite(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setNom("");
    setTutelle("");
    setMentionSignature("");
    setLogoGauche("");
    setLogoDroite("");
    setEditingInstitution(null);
  };

  const openEditForm = (institution: Institution) => {
    setEditingInstitution(institution);
    setNom(institution.nom);
    setTutelle(institution.tutelle);
    setMentionSignature(institution.mentionSignature);
    setLogoGauche(institution.logoGauche || "");
    setLogoDroite(institution.logoDroite || "");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom.trim() || !tutelle.trim() || !mentionSignature.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (editingInstitution) {
        updateInstitution(editingInstitution.id, {
          nom: nom.trim(),
          tutelle: tutelle.trim(),
          mentionSignature: mentionSignature.trim(),
          logoGauche,
          logoDroite,
        });
        toast.success("Institution modifiée avec succès");
      } else {
        const newInst = addInstitution({
          nom: nom.trim(),
          tutelle: tutelle.trim(),
          mentionSignature: mentionSignature.trim(),
          logoGauche,
          logoDroite,
        });
        onSelectInstitution(newInst.id);
        toast.success("Institution ajoutée avec succès");
      }

      refreshInstitutions();
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette institution ?")) {
      return;
    }

    try {
      deleteInstitution(id);
      refreshInstitutions();
      if (selectedInstitutionId === id) {
        const remaining = getInstitutions();
        if (remaining.length > 0) {
          onSelectInstitution(remaining[0].id);
        }
      }
      toast.success("Institution supprimée");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  return (
    <Card className="card-institutional">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif text-primary flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Institutions
          </CardTitle>
          <Dialog
            open={isFormOpen}
            onOpenChange={(open) => {
              setIsFormOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-primary">
                  {editingInstitution ? "Modifier l'institution" : "Nouvelle institution"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de l'institution *</Label>
                  <Input
                    id="nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: Institut Supérieur des Études Sociales"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutelle">Tutelle *</Label>
                  <Textarea
                    id="tutelle"
                    value={tutelle}
                    onChange={(e) => setTutelle(e.target.value)}
                    placeholder="Ex: République Démocratique du Congo – Enseignement Supérieur et Universitaire"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mentionSignature">Mention de signature *</Label>
                  <Input
                    id="mentionSignature"
                    value={mentionSignature}
                    onChange={(e) => setMentionSignature(e.target.value)}
                    placeholder="Ex: Directeur Général, Recteur..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Logo Gauche */}
                  <div className="space-y-2">
                    <Label>Logo Gauche</Label>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
                      {logoGauche ? (
                        <div className="relative inline-block">
                          <img
                            src={logoGauche}
                            alt="Logo gauche"
                            className="h-20 w-20 object-contain mx-auto"
                          />
                          <button
                            type="button"
                            onClick={() => setLogoGauche("")}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Cliquez pour uploader
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLogoUpload(e, "left")}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Logo Droite */}
                  <div className="space-y-2">
                    <Label>Logo Droite</Label>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
                      {logoDroite ? (
                        <div className="relative inline-block">
                          <img
                            src={logoDroite}
                            alt="Logo droite"
                            className="h-20 w-20 object-contain mx-auto"
                          />
                          <button
                            type="button"
                            onClick={() => setLogoDroite("")}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Cliquez pour uploader
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLogoUpload(e, "right")}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingInstitution ? "Modifier" : "Ajouter"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>Institution active</Label>
          <Select
            value={selectedInstitutionId}
            onValueChange={onSelectInstitution}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une institution" />
            </SelectTrigger>
            <SelectContent>
              {institutions.map((inst) => (
                <SelectItem key={inst.id} value={inst.id}>
                  {inst.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Liste des institutions */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {institutions.map((inst) => (
            <div
              key={inst.id}
              className={`p-3 rounded-lg border ${
                selectedInstitutionId === inst.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{inst.nom}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {inst.mentionSignature}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => openEditForm(inst)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  {institutions.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(inst.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstitutionManager;
