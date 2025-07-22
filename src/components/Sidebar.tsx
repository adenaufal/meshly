import React from 'react';
import { ColorSection } from './sidebar/ColorSection';
import { FilterSection } from './sidebar/FilterSection';
import { CanvasSection } from './sidebar/CanvasSection';
import { AnimationSection } from './sidebar/AnimationSection';
import { GradientState, ColorPoint, FilterState, CanvasState } from '../types/gradient';

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
  return (
    <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 max-h-screen">
      <div className="p-4 space-y-2">
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
      </div>
    </aside>
  );
}