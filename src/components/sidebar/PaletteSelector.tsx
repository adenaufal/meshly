import React from 'react';
import { ColorPreset } from '../../types/gradient';

interface PaletteSelectorProps {
  presets: ColorPreset[];
  selectedPreset: ColorPreset;
  onSelect: (preset: ColorPreset) => void;
  title?: string;
  className?: string;
}

/**
 * Dropdown component for selecting a preset palette and previewing leading colors.
 */
export function PaletteSelector({
  presets,
  selectedPreset,
  onSelect,
  title = 'Choose Palette',
  className = '',
}: PaletteSelectorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = presets.find((candidate) => candidate.name === event.target.value);
    if (preset) {
      onSelect(preset);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</h4>
      <div className="relative">
        <select
          value={selectedPreset.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
        >
          {presets.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex space-x-1">
          {selectedPreset.colors.slice(0, 3).map((color, index) => (
            <div
              key={`${selectedPreset.name}-${index}`}
              className="w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

