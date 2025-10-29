import React from 'react';
import { ColorSection } from './sidebar/ColorSection';
import { FilterSection } from './sidebar/FilterSection';
import { CanvasSection } from './sidebar/CanvasSection';
import { AnimationSection } from './sidebar/AnimationSection';
import { GradientState, ColorPoint, FilterState, CanvasState, AnimationState } from '../types/gradient';

interface SidebarProps {
  gradientState: GradientState;
  onColorsChange: (colors: ColorPoint[]) => void;
  onFiltersChange: (filters: FilterState) => void;
  onCanvasChange: (canvas: CanvasState) => void;
  onGradientStateChange: (updates: Partial<GradientState>) => void;
  selectedColorId: string | null;
  onColorSelect: (id: string | null) => void;
}

export function Sidebar({
  gradientState,
  onColorsChange,
  onFiltersChange,
  onCanvasChange,
  onGradientStateChange,
  selectedColorId,
  onColorSelect,
}: SidebarProps) {
  const handleAnimationChange = (animation: AnimationState) => {
    onGradientStateChange({ animation });
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex-shrink-0 h-full flex flex-col">
      <div className="p-4 space-y-2 flex-1 overflow-y-auto">
        <ColorSection
          colors={gradientState.colors}
          onColorsChange={onColorsChange}
          selectedColorId={selectedColorId}
          onColorSelect={onColorSelect}
          adjustColorPosition={gradientState.adjustColorPosition}
          onAdjustColorPositionChange={(adjust) => 
            onGradientStateChange({ adjustColorPosition: adjust })
          }
        />
        
        <FilterSection
          filters={gradientState.filters}
          onFiltersChange={onFiltersChange}
        />
        
        <CanvasSection
          canvas={gradientState.canvas}
          onCanvasChange={onCanvasChange}
          onGradientStateChange={onGradientStateChange}
        />

        <AnimationSection
          animation={gradientState.animation}
          colors={gradientState.colors}
          onAnimationChange={handleAnimationChange}
        />
      </div>
    </aside>
  );
}
