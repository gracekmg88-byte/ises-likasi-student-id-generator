import { useState, useEffect } from "react";
import { AppUser } from "@/types/student";
import { getUsers, setUserPremium, deleteUser, getRemainingTrialDays, isTrialActive } from "@/lib/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Crown, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UserManager = () => {
  const [users, setUsers] = useState<AppUser[]>([]);

  const refreshUsers = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleTogglePremium = (user: AppUser) => {
    try {
      setUserPremium(user.id, !user.isPremium);
      refreshUsers();
      toast.success(
        user.isPremium 
          ? `${user.nom} est maintenant un utilisateur gratuit` 
          : `${user.nom} est maintenant Premium !`
      );
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = (user: AppUser) => {
    try {
      deleteUser(user.id);
      refreshUsers();
      toast.success("Utilisateur supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Aucun utilisateur inscrit</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestion des Utilisateurs ({users.length})
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={refreshUsers}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {users.map((user) => {
            const trialActive = isTrialActive(user);
            const remainingDays = getRemainingTrialDays(user);
            
            return (
              <div key={user.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{user.nom}</p>
                      {user.isPremium ? (
                        <Badge className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground gap-1">
                          <Crown className="h-3 w-3" />
                          Premium
                        </Badge>
                      ) : trialActive ? (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Essai ({remainingDays}j)
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Expiré
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Inscrit le {formatDate(user.dateCreation)}
                      {user.isPremium && user.dateActivation && (
                        <span className="ml-2">
                          • Premium depuis {formatDate(user.dateActivation)}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={user.isPremium ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleTogglePremium(user)}
                      className={!user.isPremium ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : ""}
                    >
                      {user.isPremium ? (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Révoquer
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-1" />
                          Activer Premium
                        </>
                      )}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer {user.nom} ({user.email}) ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(user)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManager;
