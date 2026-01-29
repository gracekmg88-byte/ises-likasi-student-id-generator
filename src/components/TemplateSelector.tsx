import { CardTemplate } from "@/types/student";
import { CARD_TEMPLATES } from "@/lib/templateStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LayoutTemplate, CheckCircle } from "lucide-react";

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
}

const TemplateSelector = ({
  selectedTemplateId,
  onSelectTemplate,
}: TemplateSelectorProps) => {
  const getTemplatePreview = (style: CardTemplate["style"]) => {
    switch (style) {
      case "classic":
        return (
          <div className="w-full h-16 rounded border overflow-hidden">
            <div className="h-4 bg-primary" />
            <div className="h-2 bg-secondary/50" />
            <div className="flex gap-1 p-1">
              <div className="w-4 h-6 bg-muted rounded" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1.5 bg-muted rounded w-3/4" />
                <div className="h-1 bg-muted/50 rounded w-1/2" />
              </div>
              <div className="w-4 h-4 bg-muted rounded" />
            </div>
          </div>
        );
      case "modern":
        return (
          <div className="w-full h-16 rounded border overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="h-3 bg-gradient-to-r from-primary/80 to-primary/60" />
            <div className="flex gap-1 p-1">
              <div className="w-5 h-7 bg-white rounded shadow-sm" />
              <div className="flex-1 space-y-0.5 pt-1">
                <div className="h-1.5 bg-primary/30 rounded w-2/3" />
                <div className="h-1 bg-muted rounded w-1/2" />
              </div>
              <div className="w-5 h-5 bg-white rounded shadow-sm" />
            </div>
          </div>
        );
      case "advanced":
        return (
          <div className="w-full h-16 rounded border overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20">
            <div className="h-4 bg-gradient-to-r from-primary via-primary/80 to-secondary/80" />
            <div className="flex gap-1 p-1">
              <div className="w-5 h-6 bg-white/80 rounded-lg shadow" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1.5 bg-gradient-to-r from-primary to-secondary rounded w-3/4" />
                <div className="h-1 bg-muted/70 rounded w-1/2" />
              </div>
              <div className="w-4 h-4 bg-gradient-to-br from-primary to-secondary rounded" />
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="card-institutional">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif text-primary flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5" />
          Modèle de carte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedTemplateId}
          onValueChange={onSelectTemplate}
          className="space-y-3"
        >
          {CARD_TEMPLATES.map((template) => (
            <div key={template.id} className="relative">
              <Label
                htmlFor={template.id}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTemplateId === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem
                  value={template.id}
                  id={template.id}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{template.nom}</span>
                    {selectedTemplateId === template.id && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                  {getTemplatePreview(template.style)}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
