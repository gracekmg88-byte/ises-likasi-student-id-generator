import { CardTemplate } from "@/types/student";

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: "classic",
    nom: "Classique Institutionnel",
    description: "Design traditionnel avec en-tête bleu et or, sobre et professionnel. Recto-Verso inclus.",
    style: "classic",
    isPremium: false,
  },
  {
    id: "modern",
    nom: "Moderne Épuré",
    description: "Design minimaliste avec lignes épurées et espaces blancs. Recto-Verso inclus.",
    style: "modern",
    isPremium: true,
  },
  {
    id: "advanced",
    nom: "Graphique Avancé",
    description: "Design contemporain avec dégradés et éléments graphiques. Recto-Verso inclus.",
    style: "advanced",
    isPremium: true,
  },
  {
    id: "premium",
    nom: "Premium Institutionnel",
    description: "Design haut de gamme avec finitions élégantes, hologramme et sécurité renforcée. Recto-Verso.",
    style: "premium",
    isPremium: true,
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

export const getAvailableTemplates = (isPremium: boolean): CardTemplate[] => {
  if (isPremium) return CARD_TEMPLATES;
  return CARD_TEMPLATES.filter((t) => !t.isPremium);
};
