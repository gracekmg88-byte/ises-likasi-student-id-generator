import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  HardDrive, 
  Trash2, 
  Zap, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { getStorageInfo, optimizeStorage, removeOldPhotos, clearAllStudents } from "@/lib/studentStore";
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

const StorageManager = () => {
  const [storageInfo, setStorageInfo] = useState({
    studentCount: 0,
    usedKB: 0,
    percentage: 0,
    availableKB: 0
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  const refreshStorageInfo = () => {
    setStorageInfo(getStorageInfo());
  };

  useEffect(() => {
    refreshStorageInfo();
  }, []);

  const getStatusColor = () => {
    if (storageInfo.percentage >= 90) return "text-destructive";
    if (storageInfo.percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressColor = () => {
    if (storageInfo.percentage >= 90) return "bg-destructive";
    if (storageInfo.percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await optimizeStorage();
      refreshStorageInfo();
      if (result.freed > 0) {
        toast.success(`Optimisation terminée ! ${result.freed} KB libérés.`);
      } else {
        toast.info("Le stockage est déjà optimisé.");
      }
    } catch (error) {
      toast.error("Erreur lors de l'optimisation");
    }
    setIsOptimizing(false);
  };

  const handleRemoveOldPhotos = () => {
    const result = removeOldPhotos(5);
    refreshStorageInfo();
    if (result.removed > 0) {
      toast.success(`${result.removed} photos supprimées des anciens étudiants.`);
    } else {
      toast.info("Aucune photo à supprimer.");
    }
  };

  const handleClearAll = () => {
    clearAllStudents();
    // Force un délai pour s'assurer que localStorage est vidé
    setTimeout(() => {
      refreshStorageInfo();
      toast.success("Stockage vidé ! Toutes les données ont été supprimées.");
    }, 100);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HardDrive className="h-5 w-5 text-primary" />
          Gestion du stockage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Indicateur d'espace */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Espace utilisé</span>
            <span className={`font-semibold ${getStatusColor()}`}>
              {storageInfo.usedKB} KB / ~5000 KB
            </span>
          </div>
          <div className="relative">
            <Progress value={storageInfo.percentage} className="h-3" />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${storageInfo.percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {storageInfo.percentage >= 90 ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Stockage critique
                </Badge>
              ) : storageInfo.percentage >= 70 ? (
                <Badge className="gap-1 bg-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  Stockage élevé
                </Badge>
              ) : (
                <Badge className="gap-1 bg-green-500">
                  <CheckCircle className="h-3 w-3" />
                  Stockage OK
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {storageInfo.studentCount} étudiant{storageInfo.studentCount > 1 ? 's' : ''} • 
              {storageInfo.availableKB} KB disponibles
            </span>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStorageInfo}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            {isOptimizing ? "Optimisation..." : "Optimiser"}
          </Button>
        </div>

        {/* Actions avancées */}
        <div className="pt-2 border-t space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Actions avancées</p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer photos anciennes (garder 5 derniers)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer les photos anciennes ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action supprimera les photos des étudiants les plus anciens, 
                  en conservant uniquement les 5 derniers enregistrés. Les données des étudiants 
                  seront conservées, seules les photos seront supprimées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveOldPhotos}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer tous les étudiants
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer tous les étudiants ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes les données des étudiants 
                  seront définitivement supprimées du stockage local.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAll}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Supprimer tout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageManager;
