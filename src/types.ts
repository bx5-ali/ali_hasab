export type MathModuleType = 'counting' | 'addition' | 'subtraction' | 'multiplication' | 'division' | 'adventure';

export type ItemThemeId = 'apple' | 'car' | 'star' | 'candy' | 'cupcake' | 'ball' | 'flower' | 'pencil';

export interface ItemTheme {
  id: ItemThemeId;
  nameAr: string;
  nameEn: string;
  emoji: string;
  iconBg: string;
  color: string;
}

export type NumeralSystem = 'eastern' | 'western'; // 'eastern' = ١ ٢ ٣, 'western' = 1 2 3

export interface MathChallenge {
  id: string;
  module: MathModuleType;
  level: number;
  questionAr: string;
  questionEn: string;
  num1: number;
  num2: number;
  operation: '+' | '-' | '×' | '÷' | 'count';
  correctAnswer: number;
  options: number[];
  hintAr?: string;
  hintEn?: string;
}

export interface UserStats {
  stars: number;
  streak: number;
  completedChallenges: number;
  unlockedBadges: string[];
}

export interface SoundConfig {
  soundFxEnabled: boolean;
  voiceSpeechEnabled: boolean;
  language: 'ar' | 'en';
  numeralSystem: NumeralSystem;
}

export interface RewardModalData {
  isOpen: boolean;
  starsEarned: number;
  maxStars?: number;
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  bonusLabelAr?: string;
  bonusLabelEn?: string;
  onNext?: () => void;
  onRetry?: () => void;
}

