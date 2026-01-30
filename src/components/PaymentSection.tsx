import { useState, useEffect } from "react";
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
  Crown,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { getPaymentSettings } from "@/lib/paymentSettingsStore";
import { PaymentSettings } from "@/types/student";

const PaymentSection = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    setSettings(getPaymentSettings());
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copié dans le presse-papier !");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openWhatsApp = () => {
    if (!settings) return;
    const message = encodeURIComponent(
      "Bonjour, je souhaite activer mon compte Premium KMG. Voici ma preuve de paiement :"
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, "_blank");
  };

  if (!settings) return null;

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
          Achetez des crédits de cartes et accédez à tous les designs professionnels
        </p>
      </div>

      {/* Offres Premium */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-2 border-secondary/50 bg-gradient-to-br from-secondary/10 to-transparent">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <span className="text-4xl font-bold text-secondary">50$</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Pack Standard</h3>
            <p className="text-muted-foreground text-sm mb-4">
              <Zap className="h-4 w-4 inline mr-1" />
              10 cartes d'étudiants
            </p>
            <ul className="text-sm space-y-1 text-left">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Accès à tous les modèles
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Format Recto-Verso
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Export PDF haute qualité
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary text-primary-foreground">Populaire</Badge>
          </div>
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <span className="text-4xl font-bold text-primary">100$</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Pack Pro</h3>
            <p className="text-muted-foreground text-sm mb-4">
              <Zap className="h-4 w-4 inline mr-1" />
              20 cartes d'étudiants
            </p>
            <ul className="text-sm space-y-1 text-left">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Accès à tous les modèles
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Format Recto-Verso
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Export PDF haute qualité
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <strong>Meilleur rapport qualité/prix</strong>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

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
                  <p className="font-bold text-lg">{settings.mobileMoneyNumber}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(settings.mobileMoneyNumber.replace(/\s/g, ''), "mobile")}
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
                  <p className="font-semibold">{settings.mobileMoneyBeneficiary}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(settings.mobileMoneyBeneficiary, "beneficiaire1")}
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
              <p className="font-semibold">{settings.bankName}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Compte USD</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs font-semibold">{settings.bankAccountUSD}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(settings.bankAccountUSD, "usd")}
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
                  <p className="font-mono text-xs font-semibold">{settings.bankAccountCDF}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(settings.bankAccountCDF, "cdf")}
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
              <p className="font-semibold">{settings.bankBeneficiary}</p>
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
                l'activation de votre quota de cartes. L'activation est effectuée manuellement 
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
        L'activation du quota de cartes se fait dans un délai de 24h maximum après réception de la preuve de paiement.
      </p>
    </div>
  );
};

export default PaymentSection;
