import { ItemTheme, ItemThemeId, MathChallenge, MathModuleType, NumeralSystem } from '../types';

export const ITEM_THEMES: ItemTheme[] = [
  {
    id: 'apple',
    nameAr: 'تفاح',
    nameEn: 'Apples',
    emoji: '🍎',
    iconBg: 'bg-red-100 text-red-600 border-red-200',
    color: '#ef4444',
  },
  {
    id: 'car',
    nameAr: 'سيارات',
    nameEn: 'Cars',
    emoji: '🚗',
    iconBg: 'bg-blue-100 text-blue-600 border-blue-200',
    color: '#3b82f6',
  },
  {
    id: 'candy',
    nameAr: 'حلوى',
    nameEn: 'Candies',
    emoji: '🍬',
    iconBg: 'bg-pink-100 text-pink-600 border-pink-200',
    color: '#ec4899',
  },
  {
    id: 'star',
    nameAr: 'نجوم',
    nameEn: 'Stars',
    emoji: '⭐',
    iconBg: 'bg-amber-100 text-amber-600 border-amber-200',
    color: '#f59e0b',
  },
  {
    id: 'cupcake',
    nameAr: 'كب كيك',
    nameEn: 'Cupcakes',
    emoji: '🧁',
    iconBg: 'bg-purple-100 text-purple-600 border-purple-200',
    color: '#a855f7',
  },
  {
    id: 'ball',
    nameAr: 'كرات',
    nameEn: 'Balls',
    emoji: '⚽',
    iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    color: '#10b981',
  },
  {
    id: 'flower',
    nameAr: 'زهور',
    nameEn: 'Flowers',
    emoji: '🌸',
    iconBg: 'bg-rose-100 text-rose-600 border-rose-200',
    color: '#f43f5e',
  },
  {
    id: 'pencil',
    nameAr: 'أقلام',
    nameEn: 'Pencils',
    emoji: '✏️',
    iconBg: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    color: '#eab308',
  },
];

// Helper to convert western digits (1 2 3) to eastern Arabic numerals (١ ٢ ٣) if requested
export function formatNumber(num: number | string, system: NumeralSystem = 'eastern'): string {
  const str = String(num);
  if (system === 'western') return str;
  const easternDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[0-9]/g, (d) => easternDigits[parseInt(d, 10)]);
}

// Characters for Division Fair-Sharing
export interface FriendCharacter {
  id: string;
  nameAr: string;
  nameEn: string;
  avatar: string;
  colorBg: string;
}

export const FRIEND_CHARACTERS: FriendCharacter[] = [
  { id: '1', nameAr: 'سامي', nameEn: 'Sami', avatar: '👦', colorBg: 'bg-sky-100 border-sky-300 text-sky-700' },
  { id: '2', nameAr: 'ليلى', nameEn: 'Layla', avatar: '👧', colorBg: 'bg-pink-100 border-pink-300 text-pink-700' },
  { id: '3', nameAr: 'كريم', nameEn: 'Kareem', avatar: '🧒', colorBg: 'bg-amber-100 border-amber-300 text-amber-700' },
  { id: '4', nameAr: 'نور', nameEn: 'Nour', avatar: '👧🏻', colorBg: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
  { id: '5', nameAr: 'عمر', nameEn: 'Omar', avatar: '👦🏼', colorBg: 'bg-violet-100 border-violet-300 text-violet-700' },
  { id: '6', nameAr: 'سارة', nameEn: 'Sara', avatar: '👧🏼', colorBg: 'bg-rose-100 border-rose-300 text-rose-700' },
];

// Procedural challenge generator for endless practice
export function generateChallenge(module: MathModuleType, difficultyLevel: number = 1): MathChallenge {
  const id = `ch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let num1 = 1;
  let num2 = 1;
  let operation: '+' | '-' | '×' | '÷' | 'count' = 'count';
  let correctAnswer = 1;
  let questionAr = '';
  let questionEn = '';
  let hintAr = '';
  let hintEn = '';

  const maxVal = difficultyLevel === 1 ? 5 : difficultyLevel === 2 ? 10 : 20;

  if (module === 'counting') {
    operation = 'count';
    num1 = Math.floor(Math.random() * (difficultyLevel === 1 ? 7 : 15)) + 1;
    num2 = 0;
    correctAnswer = num1;
    questionAr = `كم عنصراً ترى أمامك في الشاشة؟`;
    questionEn = `How many items do you see on the screen?`;
    hintAr = `اضغط على كل عنصر لتعده بالترتيب!`;
    hintEn = `Tap each item to count them one by one!`;
  } else if (module === 'addition') {
    operation = '+';
    num1 = Math.floor(Math.random() * (maxVal / 2)) + 1;
    num2 = Math.floor(Math.random() * (maxVal / 2)) + 1;
    correctAnswer = num1 + num2;
    questionAr = `ما هو حاصل جمع: ${num1} + ${num2} ؟`;
    questionEn = `What is the sum of: ${num1} + ${num2}?`;
    hintAr = `اسحب العناصر واجمعها في الطبق الكبير!`;
    hintEn = `Drag and combine the items into the big plate!`;
  } else if (module === 'subtraction') {
    operation = '-';
    correctAnswer = Math.floor(Math.random() * (maxVal - 1)) + 1;
    num2 = Math.floor(Math.random() * (maxVal - correctAnswer)) + 1;
    num1 = correctAnswer + num2;
    questionAr = `ما هو ناتج طرح: ${num1} - ${num2} ؟`;
    questionEn = `What is: ${num1} - ${num2}?`;
    hintAr = `اضغط على ${num2} عناصر لإخفائها وعدّ ما تبقى!`;
    hintEn = `Tap ${num2} items to remove them and count the rest!`;
  } else if (module === 'multiplication') {
    operation = '×';
    const maxMultiplier = difficultyLevel === 1 ? 4 : difficultyLevel === 2 ? 6 : 9;
    num1 = Math.floor(Math.random() * (maxMultiplier - 1)) + 2; // bags (e.g. 3)
    num2 = Math.floor(Math.random() * (maxMultiplier - 1)) + 2; // items per bag (e.g. 4)
    correctAnswer = num1 * num2;
    questionAr = `لدينا ${num1} أكياس، في كل كيس ${num2} قطع. كم المجموع الكلي (${num1} × ${num2})؟`;
    questionEn = `We have ${num1} bags with ${num2} items each. What is ${num1} × ${num2}?`;
    hintAr = `اجمع الكتل: ${Array(num1).fill(num2).join(' + ')}`;
    hintEn = `Repeated addition: ${Array(num1).fill(num2).join(' + ')}`;
  } else {
    // division
    operation = '÷';
    const divisor = Math.floor(Math.random() * (difficultyLevel === 1 ? 3 : 4)) + 2; // e.g. 2, 3, 4 children
    const quotient = Math.floor(Math.random() * (difficultyLevel === 1 ? 4 : 6)) + 2; // e.g. 3, 4 items each
    num2 = divisor;
    num1 = divisor * quotient;
    correctAnswer = quotient;
    questionAr = `وزّع ${num1} بالتساوي على ${num2} أطفال. كم نصيب كل طفل (${num1} ÷ ${num2})؟`;
    questionEn = `Share ${num1} equally among ${num2} friends. What is ${num1} ÷ ${num2}?`;
    hintAr = `وزع العناصر قطعة قطعة على الأطفال حتى ينتهي العدد!`;
    hintEn = `Distribute items equally into each plate!`;
  }

  // Generate 3 unique distractors + correct answer
  const optionsSet = new Set<number>([correctAnswer]);
  while (optionsSet.size < 4) {
    const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const option = Math.max(1, correctAnswer + (delta === 0 ? 1 : delta));
    optionsSet.add(option);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id,
    module,
    level: difficultyLevel,
    questionAr,
    questionEn,
    num1,
    num2,
    operation,
    correctAnswer,
    options,
    hintAr,
    hintEn,
  };
}
