import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Admin } from "@/types/student";
import { getAdmins, addAdmin, deleteAdmin, updateAdmin } from "@/lib/adminStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, Trash2, Edit, AlertCircle, Shield } from "lucide-react";
import { toast } from "sonner";

const AdminManager = () => {
  const [admins, setAdmins] = useState<Admin[]>(getAdmins());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [error, setError] = useState("");

  const refreshAdmins = () => {
    setAdmins(getAdmins());
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setNom("");
    setError("");
    setEditingAdmin(null);
  };

  const openEditForm = (admin: Admin) => {
    setEditingAdmin(admin);
    setEmail(admin.email);
    setNom(admin.nom);
    setPassword(""); // Ne pas pré-remplir le mot de passe
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !nom.trim()) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!editingAdmin && !password) {
      setError("Le mot de passe est obligatoire pour un nouvel administrateur");
      return;
    }

    if (password && password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      if (editingAdmin) {
        const updates: Partial<Admin> = {
          email: email.trim(),
          nom: nom.trim(),
        };
        if (password) {
          updates.password = password;
        }
        updateAdmin(editingAdmin.id, updates);
        toast.success("Administrateur modifié avec succès");
      } else {
        addAdmin({
          email: email.trim(),
          password,
          nom: nom.trim(),
        });
        toast.success("Administrateur ajouté avec succès");
      }

      refreshAdmins();
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet administrateur ?")) {
      return;
    }

    try {
      deleteAdmin(id);
      refreshAdmins();
      toast.success("Administrateur supprimé");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  return (
    <Card className="card-institutional">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif text-primary flex items-center gap-2">
            <Users className="h-5 w-5" />
            Administrateurs
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-primary flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {editingAdmin ? "Modifier l'administrateur" : "Nouvel administrateur"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-nom">Nom complet *</Label>
                  <Input
                    id="admin-nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: Jean Dupont"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email *</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">
                    Mot de passe {editingAdmin ? "(laisser vide pour ne pas modifier)" : "*"}
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!editingAdmin}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingAdmin ? "Modifier" : "Ajouter"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{admin.nom}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {admin.email}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => openEditForm(admin)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                {admins.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(admin.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminManager;
