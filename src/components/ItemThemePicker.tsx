import React from 'react';
import { ItemTheme, ItemThemeId } from '../types';
import { ITEM_THEMES } from '../utils/mathData';
import { Sparkles } from 'lucide-react';

interface ItemThemePickerProps {
  currentTheme: ItemTheme;
  onSelectTheme: (theme: ItemTheme) => void;
  language: 'ar' | 'en';
}

export const ItemThemePicker: React.FC<ItemThemePickerProps> = ({
  currentTheme,
  onSelectTheme,
  language,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar w-full">
      <span className="text-xs font-black text-white flex items-center gap-1.5 shrink-0 ml-1 drop-shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
        {language === 'ar' ? 'اختر العناصر التفاعلية:' : 'Visual Items:'}
      </span>
      {ITEM_THEMES.map((theme) => {
        const isSelected = currentTheme.id === theme.id;
        return (
          <button
            key={theme.id}
            id={`theme-btn-${theme.id}`}
            onClick={() => onSelectTheme(theme)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-bold transition-all transform active:scale-95 shrink-0 backdrop-blur-xl border ${
              isSelected
                ? 'bg-white/95 text-pink-600 border-white scale-105 shadow-lg font-black'
                : 'bg-white/30 text-white border-white/30 hover:bg-white/45 shadow-xs'
            }`}
          >
            <span className="text-base">{theme.emoji}</span>
            <span>{language === 'ar' ? theme.nameAr : theme.nameEn}</span>
          </button>
        );
      })}
    </div>
  );
};
