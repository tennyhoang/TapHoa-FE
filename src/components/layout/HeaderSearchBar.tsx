'use client';

import { useRef } from 'react';
import { Search, X, TrendingUp, ChevronRight } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  showSuggestions: boolean;
  hotKeywords: string[];
  onSuggestionClick: (kw: string) => void;
  searchButtonLabel: string;
  placeholder: string;
  popularSearchesLabel: string;
}

export function HeaderSearchBar({
  search,
  onSearchChange,
  onSubmit,
  onFocus,
  onBlur,
  showSuggestions,
  hotKeywords,
  onSuggestionClick,
  searchButtonLabel,
  placeholder,
  popularSearchesLabel,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="flex-1 relative">
      <div className="relative">
        <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full pl-8 sm:pl-10 pr-16 sm:pr-20 py-2 sm:py-2.5 rounded-full text-sm bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all text-foreground placeholder-muted-foreground"
        />
        <button
          type="submit"
          className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-6 sm:h-7 px-2.5 sm:px-4 text-xs font-semibold transition-colors"
        >
          {searchButtonLabel}
        </button>
      </div>

      {search && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          className="absolute right-14 sm:right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <div
        onMouseDown={e => e.preventDefault()}
        className={`absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden transition-all duration-150 origin-top ${
          showSuggestions && !search
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-muted-foreground tracking-[0.14em] uppercase">
          {popularSearchesLabel}
        </p>
        {hotKeywords.map(keyword => (
          <button
            key={keyword}
            type="button"
            onClick={() => onSuggestionClick(keyword)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors text-left"
          >
            <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{keyword}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
          </button>
        ))}
      </div>
    </form>
  );
}
