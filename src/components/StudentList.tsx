import { Student } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, Download, Trash2 } from "lucide-react";
import { deleteStudent } from "@/lib/studentStore";
import { toast } from "sonner";

interface StudentListProps {
  students: Student[];
  onRefresh: () => void;
  onSelectStudent: (student: Student) => void;
  onGeneratePDF: (student: Student) => void;
}

const StudentList = ({
  students,
  onRefresh,
  onSelectStudent,
  onGeneratePDF,
}: StudentListProps) => {
  const handleDelete = (student: Student) => {
    if (confirm(`Supprimer l'étudiant ${student.nom} ${student.prenom} ?`)) {
      deleteStudent(student.id);
      onRefresh();
      toast.success("Étudiant supprimé");
    }
  };

  if (students.length === 0) {
    return (
      <Card className="card-institutional animate-fade-in">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2 text-primary font-serif">
            <Users className="h-5 w-5" />
            Liste des Étudiants
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Aucun étudiant enregistré pour le moment.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Utilisez le formulaire pour ajouter un étudiant.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-institutional animate-fade-in">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-primary font-serif">
          <Users className="h-5 w-5" />
          Liste des Étudiants ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              {/* Photo miniature */}
              <div className="w-12 h-14 rounded overflow-hidden bg-muted flex-shrink-0 border border-primary/10">
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={`${student.prenom} ${student.nom}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    ?
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {student.nom} {student.prenom}
                </p>
                <p className="text-sm text-muted-foreground">
                  {student.faculte} • {student.promotion}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectStudent(student)}
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Voir</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onGeneratePDF(student)}
                  className="gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(student)}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentList;
