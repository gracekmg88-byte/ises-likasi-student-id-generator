import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  MessageCircle, 
  Copy, 
  CheckCircle,
  Crown
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const PaymentSection = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copié dans le presse-papier !");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Bonjour, je souhaite activer mon compte Premium KMG. Voici ma preuve de paiement :"
    );
    window.open(`https://wa.me/243998102000?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary/20 to-secondary/10 px-4 py-2 rounded-full">
          <Crown className="h-5 w-5 text-secondary" />
          <span className="font-bold text-secondary">Passez à Premium</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">
          Débloquez tous les modèles de cartes
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Accédez à tous les designs professionnels et générez des cartes illimitées
        </p>
      </div>

      {/* Avantages Premium */}
      <Card className="border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-secondary" />
            Avantages Premium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid sm:grid-cols-2 gap-3">
            {[
              "Accès à tous les modèles (4 designs)",
              "Cartes Recto-Verso haute qualité",
              "Génération PDF illimitée",
              "Support prioritaire",
              "Mises à jour gratuites",
              "Multi-institutions",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Moyens de paiement */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Mobile Money */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3 bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-5 w-5 text-primary" />
              Mobile Money
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Numéro</p>
                  <p className="font-bold text-lg">+243 998 102 000</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("+243998102000", "mobile")}
                >
                  {copiedField === "mobile" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Bénéficiaire</p>
                  <p className="font-semibold">KOT GARCIA</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("KOT GARCIA", "beneficiaire1")}
                >
                  {copiedField === "beneficiaire1" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Virement bancaire */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3 bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              Virement Bancaire
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Banque</p>
              <p className="font-semibold">Equity BCDC</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Compte USD</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs font-semibold">566100175483041</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard("566100175483041", "usd")}
                  >
                    {copiedField === "usd" ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Compte CDF</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs font-semibold">566100175482556</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard("566100175482556", "cdf")}
                  >
                    {copiedField === "cdf" ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Bénéficiaire</p>
              <p className="font-semibold">KOT MUNON GRÂCE</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="font-bold text-green-800 mb-1">
                Après votre paiement
              </h3>
              <p className="text-sm text-green-700 mb-3">
                Envoyez la preuve de paiement (capture d'écran ou reçu) via WhatsApp pour 
                l'activation de votre compte Premium. L'activation est effectuée manuellement 
                après vérification.
              </p>
              <Button 
                onClick={openWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Envoyer sur WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <p className="text-center text-xs text-muted-foreground">
        L'activation du compte Premium se fait dans un délai de 24h maximum après réception de la preuve de paiement.
      </p>
    </div>
  );
};

export default PaymentSection;
