export type ScaleCategory =
  | 'Cognición'
  | 'Ánimo y conducta'
  | 'Fragilidad y supervivencia'
  | 'Función'
  | 'Movilidad'
  | 'Enfermería'
  | 'Cuidador';

export interface ScaleDefinition {
  id: string;
  name: string;
  shortName: string;
  category: ScaleCategory;
  description: string;
  maxScore: number | string;
  timeEstimate: string;
}

export interface ScaleResult {
  scaleId: string;
  scaleName: string;
  score: number | string;
  maxScore: number | string;
  interpretation: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'info';
  reportText: string;
  timestamp: number;
  answers: Record<string, number | string>;
}

export type ActiveScreen = 'home' | 'favorites' | 'settings' | 'scale';
