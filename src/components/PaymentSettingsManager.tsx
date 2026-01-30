import { useState, useEffect } from "react";
import { PaymentSettings } from "@/types/student";
import { getPaymentSettings, updatePaymentSettings, resetPaymentSettings } from "@/lib/paymentSettingsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  MessageCircle,
  Save,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

const PaymentSettingsManager = () => {
  const [settings, setSettings] = useState<PaymentSettings>(getPaymentSettings());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setSettings(getPaymentSettings());
  }, []);

  const handleSave = () => {
    try {
      updatePaymentSettings(settings);
      setIsEditing(false);
      toast.success("Paramètres de paiement enregistrés");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleReset = () => {
    const defaultSettings = resetPaymentSettings();
    setSettings(defaultSettings);
    toast.success("Paramètres réinitialisés");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paramètres de Paiement
        </CardTitle>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-1">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mobile Money */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <Smartphone className="h-4 w-4 text-primary" />
            Mobile Money
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Numéro</Label>
              <Input
                value={settings.mobileMoneyNumber}
                onChange={(e) => setSettings({ ...settings, mobileMoneyNumber: e.target.value })}
                disabled={!isEditing}
                placeholder="+243 XXX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Bénéficiaire</Label>
              <Input
                value={settings.mobileMoneyBeneficiary}
                onChange={(e) => setSettings({ ...settings, mobileMoneyBeneficiary: e.target.value })}
                disabled={!isEditing}
                placeholder="Nom du bénéficiaire"
              />
            </div>
          </div>
        </div>

        {/* Banque */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-primary" />
            Virement Bancaire
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom de la banque</Label>
              <Input
                value={settings.bankName}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                disabled={!isEditing}
                placeholder="Nom de la banque"
              />
            </div>
            <div className="space-y-2">
              <Label>Bénéficiaire</Label>
              <Input
                value={settings.bankBeneficiary}
                onChange={(e) => setSettings({ ...settings, bankBeneficiary: e.target.value })}
                disabled={!isEditing}
                placeholder="Nom du bénéficiaire"
              />
            </div>
            <div className="space-y-2">
              <Label>Compte USD</Label>
              <Input
                value={settings.bankAccountUSD}
                onChange={(e) => setSettings({ ...settings, bankAccountUSD: e.target.value })}
                disabled={!isEditing}
                placeholder="Numéro de compte USD"
              />
            </div>
            <div className="space-y-2">
              <Label>Compte CDF</Label>
              <Input
                value={settings.bankAccountCDF}
                onChange={(e) => setSettings({ ...settings, bankAccountCDF: e.target.value })}
                disabled={!isEditing}
                placeholder="Numéro de compte CDF"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <MessageCircle className="h-4 w-4 text-green-600" />
            WhatsApp
          </h3>
          <div className="space-y-2">
            <Label>Numéro WhatsApp (sans + ni espaces)</Label>
            <Input
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              disabled={!isEditing}
              placeholder="243998102000"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSettingsManager;
