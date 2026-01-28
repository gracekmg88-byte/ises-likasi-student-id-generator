import { useState, useEffect } from "react";
import { Student } from "@/types/student";
import { getStudents } from "@/lib/studentStore";
import { generateStudentCardPDF, getImageBase64 } from "@/lib/pdfGenerator";
import { logout, isAuthenticated } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import StudentForm from "@/components/StudentForm";
import StudentList from "@/components/StudentList";
import StudentCard from "@/components/StudentCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOut, GraduationCap, QrCode, Download } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import logoIses from "@/assets/logo-ises.jpg";

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) {
      refreshStudents();
    }
  }, [authenticated]);

  const refreshStudents = () => {
    setStudents(getStudents());
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setStudents([]);
  };

  const handleStudentAdded = (student: Student) => {
    refreshStudents();
    setSelectedStudent(student);
  };

  const handleGeneratePDF = async (student: Student) => {
    try {
      toast.loading("Génération du PDF en cours...");
      const logoBase64 = await getImageBase64(logoIses);
      await generateStudentCardPDF(student, logoBase64);
      toast.dismiss();
      toast.success("Carte d'étudiant générée avec succès !");
    } catch (error) {
      toast.dismiss();
      toast.error("Erreur lors de la génération du PDF");
      console.error(error);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5">
                <img
                  src={logoIses}
                  alt="Logo ISES"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold">ISES-LIKASI</h1>
                <p className="text-xs text-primary-foreground/80">
                  Gestion des Cartes d'Étudiants
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8">
          <div className="bg-card rounded-xl shadow-lg p-6 border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary">{students.length}</h2>
                <p className="text-muted-foreground">Étudiants enregistrés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div>
            <StudentForm onStudentAdded={handleStudentAdded} />
          </div>

          {/* Liste */}
          <div>
            <StudentList
              students={students}
              onRefresh={refreshStudents}
              onSelectStudent={setSelectedStudent}
              onGeneratePDF={handleGeneratePDF}
            />
          </div>
        </div>
      </main>

      {/* Modal aperçu carte */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-primary">
              Aperçu de la carte d'étudiant
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <StudentCard student={selectedStudent} />
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
                >
                  <Download className="h-4 w-4" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
