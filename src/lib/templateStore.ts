import { CardTemplate } from "@/types/student";

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: "classic",
    nom: "Classique Institutionnel",
    description: "Design traditionnel avec en-tête bleu et or, sobre et professionnel",
    style: "classic",
  },
  {
    id: "modern",
    nom: "Moderne Épuré",
    description: "Design minimaliste avec lignes épurées et espaces blancs",
    style: "modern",
  },
  {
    id: "advanced",
    nom: "Graphique Avancé",
    description: "Design contemporain avec dégradés et éléments graphiques",
    style: "advanced",
  },
];

export const getTemplates = (): CardTemplate[] => {
  return CARD_TEMPLATES;
};

export const getTemplateById = (id: string): CardTemplate | undefined => {
  return CARD_TEMPLATES.find((t) => t.id === id);
};

export const getDefaultTemplate = (): CardTemplate => {
  return CARD_TEMPLATES[0];
};
