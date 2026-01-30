import { useState, useEffect } from "react";
import { AppUser } from "@/types/student";
import { getUsers, setUserPremium, revokePremium, deleteUser, getRemainingCards, isFreeTrialExpired, canGenerateCard, updateUser, getFreeTrialLimit } from "@/lib/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Crown, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  CreditCard,
  Plus,
  Minus
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const UserManager = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [cardsToAdd, setCardsToAdd] = useState<number>(10);
  const [dialogOpen, setDialogOpen] = useState(false);

  const refreshUsers = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleAddCards = (user: AppUser) => {
    try {
      setUserPremium(user.id, cardsToAdd);
      refreshUsers();
      setDialogOpen(false);
      toast.success(`${cardsToAdd} cartes ajoutées à ${user.nom}`);
    } catch (error) {
      toast.error("Erreur lors de l'ajout des cartes");
    }
  };

  const handleRevokePremium = (user: AppUser) => {
    try {
      revokePremium(user.id);
      refreshUsers();
      toast.success(`Premium révoqué pour ${user.nom}`);
    } catch (error) {
      toast.error("Erreur lors de la révocation");
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
            const trialExpired = isFreeTrialExpired(user);
            const remainingCards = getRemainingCards(user);
            const freeTrialLimit = getFreeTrialLimit();
            
            return (
              <div key={user.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold truncate">{user.nom}</p>
                      {user.isPremium ? (
                        <Badge className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground gap-1">
                          <Crown className="h-3 w-3" />
                          Premium
                        </Badge>
                      ) : !trialExpired ? (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Essai ({user.freeTrialUsed}/{freeTrialLimit})
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Essai terminé
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Inscrit le {formatDate(user.dateCreation)}
                    </p>
                    
                    {/* Statistiques des cartes */}
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3 text-primary" />
                        <span>
                          {user.isPremium ? (
                            <>
                              <strong>{user.cardsGenerated}</strong> / {user.cardsQuota} cartes
                            </>
                          ) : (
                            <>
                              <strong>{user.freeTrialUsed}</strong> / {freeTrialLimit} essai
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={remainingCards > 0 ? "text-green-600" : "text-destructive"}>
                          {remainingCards} restantes
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Dialog open={dialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setSelectedUser(user);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter cartes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter un quota de cartes</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <p className="text-sm text-muted-foreground">
                            Utilisateur : <strong>{user.nom}</strong>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quota actuel : <strong>{user.cardsQuota}</strong> cartes
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Déjà utilisées : <strong>{user.cardsGenerated}</strong> cartes
                          </p>
                          
                          <div className="space-y-2">
                            <Label>Nombre de cartes à ajouter</Label>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setCardsToAdd(10)}
                                className={cardsToAdd === 10 ? "border-primary" : ""}
                              >
                                10 (50$)
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setCardsToAdd(20)}
                                className={cardsToAdd === 20 ? "border-primary" : ""}
                              >
                                20 (100$)
                              </Button>
                            </div>
                            <Input
                              type="number"
                              min={1}
                              value={cardsToAdd}
                              onChange={(e) => setCardsToAdd(parseInt(e.target.value) || 1)}
                              className="mt-2"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={() => handleAddCards(user)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter {cardsToAdd} cartes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {user.isPremium && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokePremium(user)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Révoquer
                      </Button>
                    )}
                    
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
