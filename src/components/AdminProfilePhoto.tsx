import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Upload, X, User } from "lucide-react";
import { Admin } from "@/types/student";
import { updateAdminPhoto } from "@/lib/adminStore";
import { toast } from "sonner";

interface AdminProfilePhotoProps {
  admin: Admin;
  onUpdate: () => void;
}

const AdminProfilePhoto = ({ admin, onUpdate }: AdminProfilePhotoProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string>(admin.photoProfile || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La photo est trop volumineuse (max 2 Mo)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    try {
      updateAdminPhoto(admin.id, previewPhoto);
      toast.success("Photo de profil mise à jour");
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleRemove = () => {
    setPreviewPhoto("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="relative group">
          <Avatar className="h-10 w-10 border-2 border-secondary ring-2 ring-primary-foreground/20 cursor-pointer hover:ring-secondary transition-all">
            <AvatarImage src={admin.photoProfile} alt={admin.nom} />
            <AvatarFallback className="bg-primary-foreground text-primary font-bold text-sm">
              {getInitials(admin.nom)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 bg-secondary text-secondary-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-2.5 w-2.5" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-primary flex items-center gap-2">
            <User className="h-5 w-5" />
            Photo de profil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-32 h-32 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center overflow-hidden bg-muted/50 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Choisir une photo
              </Button>
              {previewPhoto && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                  Supprimer
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminProfilePhoto;
