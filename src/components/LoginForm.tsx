import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { login, getCurrentAdmin } from "@/lib/adminStore";
import { Lock, User, AlertCircle } from "lucide-react";
import { getDefaultInstitution } from "@/lib/institutionStore";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const institution = getDefaultInstitution();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simule un délai pour l'UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const admin = login(email, password);
    if (admin) {
      onLoginSuccess();
    } else {
      setError("Identifiants incorrects. Veuillez réessayer.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md card-institutional animate-scale-in">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg bg-white p-2 flex items-center justify-center">
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
              <span className="text-primary text-2xl font-bold">ISES</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {institution.tutelle.split("–")[0]}
            </p>
            <p className="text-xs text-muted-foreground">
              {institution.tutelle.split("–")[1] || "Enseignement Supérieur"}
            </p>
          </div>
          <CardTitle className="text-2xl font-serif text-primary">
            {institution.nom.length > 40 ? institution.nom.substring(0, 40) + "..." : institution.nom}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Système de Gestion des Cartes d'Étudiants
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Adresse email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 input-institutional"
                  placeholder="exemple@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 input-institutional"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full btn-institutional"
              disabled={isLoading}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Accès réservé aux administrateurs
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
