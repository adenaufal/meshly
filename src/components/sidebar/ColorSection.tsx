import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Palette, Shuffle, Plus, X } from 'lucide-react';
import { ColorPoint, ColorPreset } from '../../types/gradient';

interface ColorSectionProps {
  colors: ColorPoint[];
  onColorsChange: (colors: ColorPoint[]) => void;
  selectedColorId: string | null;
  onColorSelect: (id: string | null) => void;
  adjustColorPosition: boolean;
  onAdjustColorPositionChange: (adjust: boolean) => void;
}

const colorPresets: ColorPreset[] = [
  // Popular gradients from various sources
  { name: 'Instagram', colors: ['#833ab4', '#fd1d1d', '#fcb045'] },
  { name: 'Sunset', colors: ['#ff9a9e', '#fecfef', '#fecfef'] },
  { name: 'Ocean Blue', colors: ['#2196f3', '#21cbf3', '#21f3f3'] },
  { name: 'Purple Bliss', colors: ['#360033', '#0b8793'] },
  { name: 'Mango Pulp', colors: ['#f09819', '#edde5d'] },
  { name: 'Bloody Mary', colors: ['#ff512f', '#dd2476'] },
  { name: 'Aubergine', colors: ['#aa076b', '#61045f'] },
  { name: 'Aqua Marine', colors: ['#1a2980', '#26d0ce'] },
  { name: 'Sunrise', colors: ['#ff512f', '#f09819'] },
  { name: 'Purple Paradise', colors: ['#1d2b64', '#f8cdda'] },
  { name: 'Sea Weed', colors: ['#4cb8c4', '#3cd3ad'] },
  { name: 'Pinky', colors: ['#dd5e89', '#f7bb97'] },
  { name: 'Cherry', colors: ['#eb3349', '#f45c43'] },
  { name: 'Lemon Twist', colors: ['#3ca55c', '#b5ac49'] },
  { name: 'Horizon', colors: ['#003973', '#e5e5be'] },
  { name: 'Rose Water', colors: ['#e55d87', '#5fc3e4'] },
  { name: 'Frozen', colors: ['#403b4a', '#e7e9bb'] },
  { name: 'Mango', colors: ['#ffe259', '#ffa751'] },
  { name: 'Bloody', colors: ['#e73c7e', '#23a6d5'] },
  { name: 'Sunset Orange', colors: ['#fa709a', '#fee140'] },
  { name: 'Blue Lagoon', colors: ['#43e97b', '#38f9d7'] },
  { name: 'Pink Flavour', colors: ['#f093fb', '#f5576c'] },
  { name: 'Sublime Vivid', colors: ['#fc466b', '#3f5efb'] },
  { name: 'Sublime Light', colors: ['#a8edea', '#fed6e3'] },
  { name: 'Pun Yeta', colors: ['#108dc7', '#ef8e38'] },
  { name: 'Quepal', colors: ['#11998e', '#38ef7d'] },
  { name: 'Sand to Blue', colors: ['#3e5151', '#decba4'] },
  { name: 'Wedding Day Blues', colors: ['#40e0d0', '#ff8c00', '#ff0080'] },
  { name: 'Shifter', colors: ['#bc4e9c', '#f80759'] },
  { name: 'Red Sunset', colors: ['#355c7d', '#6c5b7b', '#c06c84'] },
  { name: 'Moon Purple', colors: ['#4e54c8', '#8f94fb'] },
  { name: 'Pure Lust', colors: ['#333333', '#dd1818'] },
  { name: 'Slight Ocean View', colors: ['#a8c0ff', '#3f2b96'] },
  { name: 'eXpresso', colors: ['#ad5389', '#3c1053'] },
  { name: 'Shifty', colors: ['#636fa4', '#e8cbc0'] },
  { name: 'Vanusa', colors: ['#da4453', '#89216b'] },
  { name: 'Evening Night', colors: ['#005aa7', '#fffde4'] },
  { name: 'Magic', colors: ['#59c173', '#a17fe0', '#5d26c1'] },
  { name: 'Moor', colors: ['#616161', '#9bc5c3'] },
  { name: 'Almost', colors: ['#ddd6f3', '#faaca8'] },
  { name: 'Forever Lost', colors: ['#5d4e75', '#abb1bb'] },
  { name: 'Winter', colors: ['#e6dada', '#274046'] },
  { name: 'Autumn', colors: ['#dac292', '#6c5b7b'] },
  { name: 'Candy', colors: ['#d3959b', '#bfe6ba'] },
  { name: 'Reef', colors: ['#00d2ff', '#3a7bd5'] },
  { name: 'The Strain', colors: ['#870000', '#190a05'] },
  { name: 'Dirty Fog', colors: ['#b993d6', '#8ca6db'] },
  { name: 'Earthly', colors: ['#649173', '#dbd5a4'] },
  { name: 'Virgin', colors: ['#c9ffbf', '#ffafbd'] },
  { name: 'Ash', colors: ['#606c88', '#3f4c6b'] },
  { name: 'Cherryblossoms', colors: ['#fbb2bd', '#fbb2bd'] },
  { name: 'Parklife', colors: ['#add100', '#7b920a'] },
  { name: 'Dance To Forget', colors: ['#ff758c', '#ff7eb3'] },
];

export function ColorSection({
  colors,
  onColorsChange,
  selectedColorId,
  onColorSelect,
  adjustColorPosition,
  onAdjustColorPositionChange,
}: ColorSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(colorPresets[0]);

  const addColor = () => {
    const newColor: ColorPoint = {
      id: Date.now().toString(),
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      x: Math.random() * 100,
      y: Math.random() * 100,
    };
    onColorsChange([...colors, newColor]);
  };

  const updateColor = (id: string, color: string) => {
    const newColors = colors.map(c => c.id === id ? { ...c, color } : c);
    onColorsChange(newColors);
  };

  const removeColor = (id: string) => {
    if (colors.length > 2) {
      onColorsChange(colors.filter(c => c.id !== id));
      if (selectedColorId === id) {
        onColorSelect(null);
      }
    }
  };

  const applyPreset = (preset: ColorPreset) => {
    const newColors = colors.map((color, index) => ({
      ...color,
      color: preset.colors[index % preset.colors.length],
    }));
    onColorsChange(newColors);
    setSelectedPreset(preset);
  };

  const randomizeColors = () => {
    const newColors = colors.map(color => ({
      ...color,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    }));
    onColorsChange(newColors);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Colors</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Custom Palette</h4>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <div key={color.id} className="relative group">
                  <div
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
                      selectedColorId === color.id
                        ? 'border-purple-500 scale-110'
                        : 'border-white shadow-md hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.color }}
                    onClick={() => onColorSelect(color.id)}
                  />
                  {colors.length > 2 && (
                    <button
                      onClick={() => removeColor(color.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addColor}
                className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {selectedColorId && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Selected Color
                </label>
                <input
                  type="color"
                  value={colors.find(c => c.id === selectedColorId)?.color || '#000000'}
                  onChange={(e) => updateColor(selectedColorId, e.target.value)}
                  className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            )}

            <button
              onClick={randomizeColors}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              <span>Randomize colors</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Choose Palette</h4>
            <div className="relative">
              <select
                value={selectedPreset.name}
                onChange={(e) => {
                  const preset = colorPresets.find(p => p.name === e.target.value);
                  if (preset) applyPreset(preset);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                {colorPresets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex space-x-1">
                {selectedPreset.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
              <button
                onClick={randomizeColors}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span>Randomize colors</span>
              </button>
              <label className="flex items-center space-x-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={adjustColorPosition}
                    onChange={(e) => onAdjustColorPositionChange(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    adjustColorPosition ? 'bg-purple-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                      adjustColorPosition ? 'translate-x-5' : 'translate-x-1'
                    } mt-1`} />
                  </div>
                </div>
                <span className="text-sm text-gray-700">Adjust position: {adjustColorPosition ? 'On' : 'Off'}</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Choose Palette</h4>
            <div className="relative">
              <select
                value={selectedPreset.name}
                onChange={(e) => {
                  const preset = colorPresets.find(p => p.name === e.target.value);
                  if (preset) applyPreset(preset);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                {colorPresets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex space-x-1">
                {selectedPreset.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}