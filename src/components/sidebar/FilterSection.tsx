import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sliders, RotateCcw, Settings } from 'lucide-react';
import { FilterState } from '../../types/gradient';

interface FilterSectionProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const filterControls = [
  { key: 'grain', label: 'Grain', min: 0, max: 100, unit: '%' },
  { key: 'blur', label: 'Blur', min: 0, max: 10, unit: 'px' },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, unit: '%' },
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, unit: '%' },
  { key: 'hue', label: 'Hue', min: -180, max: 180, unit: '°' },
];

const grainTypes = [
  { value: 'noise', label: 'Noise Image' },
  { value: 'svg', label: 'SVG Pattern' },
  { value: 'perlin', label: 'Perlin Noise' },
];

const blendModes = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'luminosity', label: 'Luminosity' },
  { value: 'plus-lighter', label: 'Plus Lighter' },
];

export function FilterSection({ filters, onFiltersChange }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAdvancedGrain, setShowAdvancedGrain] = useState(false);

  const updateFilter = (key: keyof FilterState, value: number | string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      grain: 0,
      grainType: 'noise',
      grainBlendMode: 'normal',
    });
  };

  const quickPresets = [
    { name: '0°', value: 0 },
    { name: '15°', value: 15 },
    { name: '30°', value: 30 },
    { name: '45°', value: 45 },
    { name: '60°', value: 60 },
    { name: '90°', value: 90 },
  ];

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Filters</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {filterControls.map(({ key, label, min, max, unit }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {filters[key as keyof FilterState]}{unit}
                  </span>
                  {key === 'grain' && filters.grain > 0 && (
                    <button
                      onClick={() => setShowAdvancedGrain(!showAdvancedGrain)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Advanced Grain Options"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={filters[key as keyof FilterState]}
                onChange={(e) => updateFilter(key as keyof FilterState, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          ))}

          {showAdvancedGrain && filters.grain > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-3 border">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Advanced Grain Options</h5>
                <button
                  onClick={() => setShowAdvancedGrain(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={filters.grainType}
                  onChange={(e) => updateFilter('grainType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {grainTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Blend Mode</label>
                <select
                  value={filters.grainBlendMode}
                  onChange={(e) => updateFilter('grainBlendMode', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {blendModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hue Quick Presets</label>
            <div className="flex flex-wrap gap-1">
              {quickPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateFilter('hue', preset.value)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    filters.hue === preset.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refresh filters</span>
          </button>
        </div>
      )}
    </div>
  );
}