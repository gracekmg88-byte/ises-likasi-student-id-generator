import { CardTemplate } from "@/types/student";
import { getTemplates } from "@/lib/templateStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, Lock, Crown, FileText, CheckCircle } from "lucide-react";

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  isPremium?: boolean;
}

const TemplateSelector = ({ 
  selectedTemplateId, 
  onSelectTemplate,
  isPremium = false 
}: TemplateSelectorProps) => {
  const templates = getTemplates();

  const getTemplateIcon = (style: string) => {
    switch (style) {
      case "classic":
        return "🎓";
      case "modern":
        return "✨";
      case "advanced":
        return "🎨";
      case "premium":
        return "👑";
      default:
        return "📄";
    }
  };

  const getTemplatePreview = (style: CardTemplate["style"]) => {
    switch (style) {
      case "classic":
        return (
          <div className="w-full h-14 rounded border overflow-hidden">
            <div className="h-3 bg-primary" />
            <div className="h-1.5 bg-secondary/50" />
            <div className="flex gap-1 p-1">
              <div className="w-4 h-5 bg-muted rounded" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1 bg-muted rounded w-3/4" />
                <div className="h-0.5 bg-muted/50 rounded w-1/2" />
              </div>
              <div className="w-3 h-3 bg-muted rounded" />
            </div>
          </div>
        );
      case "modern":
        return (
          <div className="w-full h-14 rounded border overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="h-3 bg-gradient-to-r from-primary/80 to-primary/60" />
            <div className="flex gap-1 p-1">
              <div className="w-4 h-5 bg-white rounded shadow-sm" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1 bg-primary/30 rounded w-2/3" />
                <div className="h-0.5 bg-muted rounded w-1/2" />
              </div>
              <div className="w-3 h-3 bg-white rounded shadow-sm" />
            </div>
          </div>
        );
      case "advanced":
        return (
          <div className="w-full h-14 rounded border overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20">
            <div className="h-3 bg-gradient-to-r from-primary via-primary/80 to-secondary/80" />
            <div className="flex gap-1 p-1">
              <div className="w-4 h-5 bg-white/80 rounded-lg shadow" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded w-3/4" />
                <div className="h-0.5 bg-muted/70 rounded w-1/2" />
              </div>
              <div className="w-3 h-3 bg-gradient-to-br from-primary to-secondary rounded" />
            </div>
          </div>
        );
      case "premium":
        return (
          <div className="w-full h-14 rounded border overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="h-0.5 bg-secondary" />
            <div className="h-3 bg-slate-800 flex items-center justify-center">
              <div className="h-1.5 w-8 bg-secondary/80 rounded-full" />
            </div>
            <div className="flex gap-1 p-1">
              <div className="w-4 h-5 bg-white rounded border border-secondary/50" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1 bg-white/50 rounded w-3/4" />
                <div className="h-0.5 bg-slate-500 rounded w-1/2" />
              </div>
              <div className="w-3 h-3 bg-white rounded border border-secondary/50" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const canSelectTemplate = (template: CardTemplate) => {
    if (isPremium) return true;
    return !template.isPremium;
  };

  return (
    <Card className="card-institutional">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-primary font-serif">
          <Palette className="h-5 w-5" />
          Modèles de Cartes
        </CardTitle>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Tous les modèles incluent Recto-Verso
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <RadioGroup
          value={selectedTemplateId}
          onValueChange={(value) => {
            const template = templates.find(t => t.id === value);
            if (template && canSelectTemplate(template)) {
              onSelectTemplate(value);
            }
          }}
          className="space-y-3"
        >
          {templates.map((template) => {
            const isLocked = !canSelectTemplate(template);
            const isSelected = selectedTemplateId === template.id;
            
            return (
              <div
                key={template.id}
                className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                  isLocked ? "cursor-not-allowed" : "cursor-pointer"
                } ${
                  isSelected
                    ? "ring-2 ring-primary border-primary bg-primary/5"
                    : isLocked
                    ? "border-muted bg-muted/30 opacity-60"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => !isLocked && onSelectTemplate(template.id)}
              >
                <RadioGroupItem
                  value={template.id}
                  id={template.id}
                  disabled={isLocked}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{getTemplateIcon(template.style)}</span>
                    <Label
                      htmlFor={template.id}
                      className="font-semibold cursor-pointer"
                    >
                      {template.nom}
                    </Label>
                    {template.isPremium && (
                      <Badge className="bg-secondary text-secondary-foreground text-[10px] gap-1">
                        <Crown className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                  {getTemplatePreview(template.style)}
                </div>
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-5 w-5" />
                      <span className="text-sm font-medium">Premium requis</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>

        {!isPremium && (
          <div className="mt-4 p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Crown className="h-4 w-4 text-secondary" />
              Passez à Premium pour débloquer tous les modèles
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
