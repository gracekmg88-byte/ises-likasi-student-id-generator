import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Student } from "@/types/student";
import { getStudentById } from "@/lib/studentStore";
import { getInstitutionById, getDefaultInstitution } from "@/lib/institutionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  QrCode,
  ArrowLeft,
  User,
  GraduationCap,
  Calendar,
  Building,
} from "lucide-react";

const VerificationPage = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStudent = async () => {
      // Petite pause pour l'effet de chargement
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      if (id) {
        const found = getStudentById(id);
        setStudent(found || null);
      } else {
        setStudent(null);
      }
      setIsLoading(false);
    };

    checkStudent();
  }, [id]);

  const institution = student?.institutionId 
    ? getInstitutionById(student.institutionId) || getDefaultInstitution()
    : getDefaultInstitution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-1 flex items-center justify-center">
                {institution.logoGauche ? (
                  <img
                    src={institution.logoGauche}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : institution.logoDroite ? (
                  <img
                    src={institution.logoDroite}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-primary text-sm font-bold">LOGO</span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold truncate max-w-[200px] sm:max-w-none">
                  {institution.nom.length > 30 ? institution.nom.substring(0, 30) + "..." : institution.nom}
                </h1>
                <p className="text-xs text-primary-foreground/80">
                  Vérification des Cartes d'Étudiants
                </p>
              </div>
            </div>
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          {isLoading ? (
            <Card className="card-institutional animate-pulse">
              <CardContent className="py-16 text-center">
                <QrCode className="h-16 w-16 mx-auto text-primary/50 mb-4 animate-spin" />
                <p className="text-lg text-muted-foreground">
                  Vérification en cours...
                </p>
              </CardContent>
            </Card>
          ) : student ? (
            <Card className="card-institutional animate-scale-in overflow-hidden">
              {/* Badge succès */}
              <div className="bg-success text-success-foreground py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-semibold text-lg">
                    CARTE VALIDE
                  </span>
                </div>
              </div>

              <CardHeader className="text-center pb-2 pt-6">
                <CardTitle className="font-serif text-primary text-xl">
                  Informations de l'Étudiant
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {institution.nom}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Photo */}
                <div className="flex justify-center">
                  <div className="w-28 h-36 rounded-lg overflow-hidden border-4 border-primary/20 shadow-xl">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={`${student.prenom} ${student.nom}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <User className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Infos */}
                <div className="space-y-4 bg-muted/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Nom complet
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {student.nom} {student.prenom}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Faculté
                      </p>
                      <p className="font-semibold text-foreground">
                        {student.faculte}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Promotion
                        </p>
                        <p className="font-semibold text-foreground">
                          {student.promotion}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Année
                        </p>
                        <p className="font-semibold text-foreground">
                          {student.anneeAcademique}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Date d'expiration:{" "}
                      <span className="font-semibold text-primary">
                        {student.dateExpiration}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-institutional animate-scale-in overflow-hidden">
              {/* Badge erreur */}
              <div className="bg-destructive text-destructive-foreground py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="h-6 w-6" />
                  <span className="font-semibold text-lg">
                    CARTE NON TROUVÉE
                  </span>
                </div>
              </div>

              <CardContent className="py-12 text-center">
                <QrCode className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Étudiant non reconnu
                </h3>
                <p className="text-muted-foreground mb-6">
                  Le QR Code scanné ne correspond à aucun étudiant enregistré
                  dans notre système.
                </p>
                <Link to="/">
                  <Button className="btn-institutional">
                    Retour à l'accueil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {!id && !isLoading && (
            <Card className="card-institutional mt-8 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-primary">
                  <QrCode className="h-5 w-5" />
                  Comment vérifier une carte ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>1. Scannez le QR Code présent sur la carte d'étudiant</p>
                <p>2. Vous serez automatiquement redirigé vers cette page</p>
                <p>
                  3. Les informations de l'étudiant s'afficheront si la carte
                  est valide
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default VerificationPage;
