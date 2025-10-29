import React from 'react';
import { Shuffle } from 'lucide-react';

interface RandomizeColorsButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

/**
 * Reusable button for triggering color randomization with consistent styling.
 */
export function RandomizeColorsButton({
  onClick,
  className = '',
  label = 'Randomize colors',
}: RandomizeColorsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors ${className}`}
    >
      <Shuffle className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

