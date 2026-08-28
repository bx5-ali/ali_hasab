export type MathModuleType = 'duo_path' | 'counting' | 'addition' | 'subtraction' | 'multiplication' | 'division' | 'adventure' | 'leaderboard' | 'quests' | 'shop';

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

export type QuestionType =
  | 'multiple_choice'
  | 'visual_count'
  | 'equation_build'
  | 'match_pairs'
  | 'true_false'
  | 'fill_blank';

export interface LessonQuestion {
  id: string;
  type: QuestionType;
  questionAr: string;
  questionEn: string;
  hintAr?: string;
  hintEn?: string;
  // Options / parameters
  options?: (number | string)[];
  correctAnswer: number | string | boolean;
  // For visual representation
  visualCount?: number;
  itemThemeId?: ItemThemeId;
  // For equation building
  equationPieces?: string[];
  targetEquation?: string[];
  // For pair matching
  matchingPairs?: { id: string; left: string; right: string }[];
  // Math operands
  num1?: number;
  num2?: number;
  operation?: '+' | '-' | '×' | '÷' | '=';
  explanationAr?: string;
  explanationEn?: string;
}

export interface PathLesson {
  id: string;
  unitId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  color: string;
  questions: LessonQuestion[];
  xpReward: number;
  starsRequiredToUnlock: number;
}

export interface PathUnit {
  id: string;
  unitNumber: number;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  themeColor: string; // e.g. emerald, sky, purple, amber, rose
  gradientBg: string;
  bannerEmoji: string;
  lessons: PathLesson[];
  chestReward?: {
    id: string;
    gems: number;
    stars: number;
    titleAr: string;
    titleEn: string;
  };
}

export interface DailyQuest {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  progress: number;
  target: number;
  xpReward: number;
  gemReward: number;
  completed: boolean;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  rank: number;
  isCurrentUser?: boolean;
  streak: number;
}

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
  // Duolingo gamification
  xp: number;
  gems: number;
  hearts: number;
  maxHearts: number;
  unlockedLessonIds: string[];
  completedLessonIds: string[];
  lessonStars: Record<string, number>; // lessonId -> 1, 2, or 3 stars
  openedChests: string[];
  dailyQuests: DailyQuest[];
  league: 'bronze' | 'silver' | 'gold' | 'diamond';
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


