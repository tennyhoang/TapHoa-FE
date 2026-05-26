'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, disabled, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'h-4 w-4 shrink-0 rounded border transition-all duration-100 flex items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1',
        checked
          ? 'bg-primary border-primary text-primary-foreground'
          : 'bg-background border-input',
        !disabled && !checked && 'hover:border-primary/60',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      {checked && (
        <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
          <path
            d="M1 4L3.5 6.5L9 1.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
