import { useState, useEffect } from "react";
import { Student, Institution, CardTemplate, AppUser } from "@/types/student";
import { getStudents } from "@/lib/studentStore";
import { getInstitutions, getDefaultInstitution, getInstitutionById } from "@/lib/institutionStore";
import { getTemplates, getDefaultTemplate, getTemplateById, getAvailableTemplates } from "@/lib/templateStore";
import { generateStudentCardPDF } from "@/lib/pdfGenerator";
import { logout, isAuthenticated, getCurrentAdmin } from "@/lib/adminStore";
import { getCurrentUser, isUserAuthenticated, logoutUser, isUserActive, getRemainingCards, canGenerateCard, decrementCardQuota, isFreeTrialExpired, getFreeTrialLimit } from "@/lib/userStore";
import LoginForm from "@/components/LoginForm";
import StudentForm from "@/components/StudentForm";
import StudentList from "@/components/StudentList";
import StudentCard from "@/components/StudentCard";
import InstitutionManager from "@/components/InstitutionManager";
import TemplateSelector from "@/components/TemplateSelector";
import AdminManager from "@/components/AdminManager";
import UserManager from "@/components/UserManager";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import PaymentSection from "@/components/PaymentSection";
import PaymentSettingsManager from "@/components/PaymentSettingsManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  LogOut, 
  GraduationCap, 
  QrCode, 
  Download, 
  Settings, 
  Users, 
  Building2,
  Crown,
  CreditCard,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cardSide, setCardSide] = useState<"recto" | "verso">("recto");
  
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("classic");
  
  const [currentAdmin, setCurrentAdmin] = useState<ReturnType<typeof getCurrentAdmin>>(undefined);
  const [currentUser, setCurrentUser] = useState<AppUser | undefined>(undefined);

  useEffect(() => {
    const adminAuth = isAuthenticated();
    const userAuth = isUserAuthenticated();
    
    if (adminAuth) {
      setAuthenticated(true);
      setIsAdminMode(true);
      setCurrentAdmin(getCurrentAdmin());
    } else if (userAuth) {
      const user = getCurrentUser();
      if (user) {
        setAuthenticated(true);
        setIsAdminMode(false);
        setCurrentUser(user);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) {
      refreshStudents();
      const defaultInst = getDefaultInstitution();
      setSelectedInstitutionId(defaultInst.id);
      const defaultTemplate = getDefaultTemplate();
      setSelectedTemplateId(defaultTemplate.id);
    }
  }, [authenticated]);

  const refreshStudents = () => {
    setStudents(getStudents());
  };

  // Rafraîchir l'utilisateur courant
  const refreshCurrentUser = () => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleLoginSuccess = (isAdmin: boolean) => {
    setAuthenticated(true);
    setIsAdminMode(isAdmin);
    if (isAdmin) {
      setCurrentAdmin(getCurrentAdmin());
    } else {
      setCurrentUser(getCurrentUser());
    }
  };

  const handleLogout = () => {
    if (isAdminMode) {
      logout();
    } else {
      logoutUser();
    }
    setAuthenticated(false);
    setIsAdminMode(false);
    setStudents([]);
    setCurrentAdmin(undefined);
    setCurrentUser(undefined);
  };

  const handleStudentAdded = (student: Student) => {
    refreshStudents();
    setSelectedStudent(student);
  };

  const canUseTemplate = (template: CardTemplate): boolean => {
    if (isAdminMode) return true;
    if (!currentUser) return false;
    if (currentUser.isPremium) return true;
    return !template.isPremium;
  };

  const handleGeneratePDF = async (student: Student) => {
    const template = getTemplateById(selectedTemplateId) || getDefaultTemplate();
    
    if (!canUseTemplate(template)) {
      toast.error("Ce modèle est réservé aux utilisateurs Premium");
      return;
    }

    // Vérifier le quota de cartes pour les utilisateurs non-admin
    if (!isAdminMode && currentUser) {
      if (!canGenerateCard(currentUser)) {
        if (currentUser.isPremium) {
          toast.error("Vous avez épuisé votre quota de cartes. Veuillez acheter des crédits supplémentaires.");
        } else {
          toast.error("Votre essai gratuit est terminé (3 cartes). Passez à Premium pour continuer.");
        }
        return;
      }
    }
    
    try {
      toast.loading("Génération du PDF Recto-Verso en cours...");
      const institution = getInstitutionById(student.institutionId || selectedInstitutionId) || getDefaultInstitution();
      await generateStudentCardPDF(student, institution, template);
      
      // Décrémenter le quota pour les utilisateurs non-admin
      if (!isAdminMode && currentUser) {
        decrementCardQuota(currentUser.id);
        refreshCurrentUser();
      }
      
      toast.dismiss();
      toast.success("Carte Recto-Verso générée avec succès !");
    } catch (error) {
      toast.dismiss();
      toast.error("Erreur lors de la génération du PDF");
      console.error(error);
    }
  };

  const getSelectedInstitution = (): Institution => {
    return getInstitutionById(selectedInstitutionId) || getDefaultInstitution();
  };

  const getSelectedTemplate = (): CardTemplate => {
    return getTemplateById(selectedTemplateId) || getDefaultTemplate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Chargement...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const remainingCards = currentUser ? getRemainingCards(currentUser) : 0;
  const trialExpired = currentUser ? isFreeTrialExpired(currentUser) : false;
  const freeTrialLimit = getFreeTrialLimit();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 flex items-center justify-center">
                {getSelectedInstitution().logoGauche ? (
                  <img
                    src={getSelectedInstitution().logoGauche}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-primary text-xs font-bold">KMG</span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold">KMG – Cartes Étudiants</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-primary-foreground/80">
                    {isAdminMode ? currentAdmin?.nom || "Administrateur" : currentUser?.nom || "Utilisateur"}
                  </p>
                  {!isAdminMode && currentUser && (
                    currentUser.isPremium ? (
                      <Badge className="bg-secondary text-secondary-foreground text-[10px] gap-1">
                        <Crown className="h-3 w-3" />
                        Premium ({remainingCards} cartes)
                      </Badge>
                    ) : !trialExpired ? (
                      <Badge variant="outline" className="text-[10px] gap-1 border-primary-foreground/30 text-primary-foreground">
                        <CreditCard className="h-3 w-3" />
                        Essai ({currentUser.freeTrialUsed}/{freeTrialLimit})
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[10px] gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Essai terminé
                      </Badge>
                    )
                  )}
                  {isAdminMode && (
                    <Badge className="bg-destructive/80 text-[10px]">Admin</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdminMode && <ChangePasswordDialog />}
              <Link to="/verification">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <QrCode className="h-4 w-4" />
                  <span className="hidden sm:inline">Vérification</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className={`grid w-full max-w-2xl ${isAdminMode ? 'grid-cols-5' : 'grid-cols-3'}`}>
            <TabsTrigger value="students" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Étudiants</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuration</span>
            </TabsTrigger>
            {!isAdminMode && (
              <TabsTrigger value="premium" className="gap-2">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Premium</span>
              </TabsTrigger>
            )}
            {isAdminMode && (
              <>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Utilisateurs</span>
                </TabsTrigger>
                <TabsTrigger value="payment" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Paiement</span>
                </TabsTrigger>
                <TabsTrigger value="admins" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Admins</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Tab Étudiants */}
          <TabsContent value="students" className="space-y-6">
            {/* Alerte essai terminé */}
            {!isAdminMode && currentUser && trialExpired && !currentUser.isPremium && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">Essai gratuit terminé</p>
                      <p className="text-sm text-muted-foreground">
                        Vous avez utilisé vos {freeTrialLimit} cartes gratuites. Passez à Premium pour continuer à générer des cartes.
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
                    onClick={() => {
                      const premiumTab = document.querySelector('[value="premium"]') as HTMLElement;
                      premiumTab?.click();
                    }}
                  >
                    <Crown className="h-4 w-4" />
                    Passer à Premium
                  </Button>
                </div>
              </div>
            )}

            {/* Bannière Premium pour utilisateurs gratuits (non expirés) */}
            {!isAdminMode && currentUser && !currentUser.isPremium && !trialExpired && (
              <div className="bg-gradient-to-r from-secondary/20 via-secondary/10 to-secondary/20 border border-secondary/30 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Crown className="h-8 w-8 text-secondary" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Essai gratuit : {remainingCards} carte{remainingCards > 1 ? 's' : ''} restante{remainingCards > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Passez à Premium pour accéder à tous les modèles et générer plus de cartes
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
                    onClick={() => {
                      const premiumTab = document.querySelector('[value="premium"]') as HTMLElement;
                      premiumTab?.click();
                    }}
                  >
                    <Crown className="h-4 w-4" />
                    Voir les offres
                  </Button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-card rounded-xl shadow-lg p-6 border border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-primary">{students.length}</h2>
                    <p className="text-muted-foreground">Étudiants enregistrés</p>
                  </div>
                </div>
                {!isAdminMode && currentUser && (
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <CreditCard className="h-5 w-5 text-secondary" />
                      <span className="text-2xl font-bold text-secondary">{remainingCards}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentUser.isPremium ? 'Cartes Premium restantes' : 'Cartes essai restantes'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              <StudentForm 
                onStudentAdded={handleStudentAdded} 
                selectedInstitutionId={selectedInstitutionId}
              />
              <StudentList
                students={students}
                onRefresh={refreshStudents}
                onSelectStudent={setSelectedStudent}
                onGeneratePDF={handleGeneratePDF}
              />
            </div>
          </TabsContent>

          {/* Tab Configuration */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <InstitutionManager
                selectedInstitutionId={selectedInstitutionId}
                onSelectInstitution={setSelectedInstitutionId}
              />
              <TemplateSelector
                selectedTemplateId={selectedTemplateId}
                onSelectTemplate={setSelectedTemplateId}
                isPremium={isAdminMode || currentUser?.isPremium || false}
              />
            </div>
          </TabsContent>

          {/* Tab Premium (utilisateurs uniquement) */}
          {!isAdminMode && (
            <TabsContent value="premium">
              <PaymentSection />
            </TabsContent>
          )}

          {/* Tab Utilisateurs (admin) */}
          {isAdminMode && (
            <TabsContent value="users">
              <UserManager />
            </TabsContent>
          )}

          {/* Tab Paramètres Paiement (admin) */}
          {isAdminMode && (
            <TabsContent value="payment">
              <PaymentSettingsManager />
            </TabsContent>
          )}

          {/* Tab Admins */}
          {isAdminMode && (
            <TabsContent value="admins">
              <div className="max-w-xl">
                <AdminManager />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Modal aperçu carte */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-primary flex items-center justify-between">
              <span>Aperçu de la carte d'étudiant</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCardSide(cardSide === "recto" ? "verso" : "recto")}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {cardSide === "recto" ? "Voir Verso" : "Voir Recto"}
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="mb-2">
                  {cardSide === "recto" ? "RECTO" : "VERSO"}
                </Badge>
              </div>
              <StudentCard 
                student={selectedStudent} 
                institution={getSelectedInstitution()}
                template={getSelectedTemplate()}
                side={cardSide}
              />
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudent(null)}
                >
                  Fermer
                </Button>
                <Button
                  className="btn-gold gap-2"
                  onClick={() => handleGeneratePDF(selectedStudent)}
                  disabled={!canUseTemplate(getSelectedTemplate()) || (!isAdminMode && currentUser && !canGenerateCard(currentUser))}
                >
                  <Download className="h-4 w-4" />
                  Télécharger PDF
                </Button>
              </div>
              {!canUseTemplate(getSelectedTemplate()) && (
                <p className="text-center text-sm text-destructive">
                  Ce modèle est réservé aux utilisateurs Premium
                </p>
              )}
              {!isAdminMode && currentUser && !canGenerateCard(currentUser) && (
                <p className="text-center text-sm text-destructive">
                  {currentUser.isPremium 
                    ? "Quota de cartes épuisé. Achetez des crédits supplémentaires."
                    : "Essai gratuit terminé. Passez à Premium pour continuer."
                  }
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
