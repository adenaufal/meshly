import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Monitor, RotateCw } from 'lucide-react';
import { CanvasState, GradientState } from '../../types/gradient';

interface CanvasSectionProps {
  canvas: CanvasState;
  onCanvasChange: (canvas: CanvasState) => void;
  onGradientStateChange: (updates: Partial<GradientState>) => void;
}

const socialTemplates = [
  // Facebook
  { platform: 'Facebook', name: 'News Feed', width: 1200, height: 1200, ratio: '1:1' },
  { platform: 'Facebook', name: 'Stories', width: 1080, height: 1920, ratio: '9:16' },
  { platform: 'Facebook', name: 'Cover Photo', width: 830, height: 312, ratio: '2.7:1' },
  { platform: 'Facebook', name: 'Event Photo', width: 1336, height: 700, ratio: '1.9:1' },
  { platform: 'Facebook', name: 'Group Photo', width: 640, height: 334, ratio: '1.9:1' },
  
  // Instagram
  { platform: 'Instagram', name: 'Feed', width: 1200, height: 1200, ratio: '1:1' },
  { platform: 'Instagram', name: 'Stories', width: 1080, height: 1920, ratio: '9:16' },
  { platform: 'Instagram', name: 'Reels', width: 1080, height: 1920, ratio: '9:16' },
  
  // Twitter
  { platform: 'Twitter', name: 'Image', width: 1200, height: 675, ratio: '16:9' },
  { platform: 'Twitter', name: 'Cover Photo', width: 1200, height: 400, ratio: '3:1' },
  { platform: 'Twitter', name: 'Fleets', width: 1080, height: 1920, ratio: '9:16' },
  
  // LinkedIn
  { platform: 'LinkedIn', name: 'Feed', width: 1200, height: 1200, ratio: '1:1' },
  { platform: 'LinkedIn', name: 'Cover Photo (Business)', width: 1128, height: 191, ratio: '5.9:1' },
  { platform: 'LinkedIn', name: 'Cover Photo (Personal)', width: 792, height: 198, ratio: '4:1' },
  { platform: 'LinkedIn', name: 'Stories', width: 1080, height: 1920, ratio: '9:16' },
  
  // YouTube
  { platform: 'YouTube', name: 'Thumbnail', width: 1280, height: 720, ratio: '16:9' },
  { platform: 'YouTube', name: 'Banner', width: 2560, height: 1440, ratio: '16:9' },
  { platform: 'YouTube', name: 'Video (4K)', width: 3840, height: 2160, ratio: '16:9' },
];

const standardTemplates = [
  { name: 'Square', width: 800, height: 800, ratio: '1:1' },
  { name: 'Landscape', width: 1200, height: 800, ratio: '3:2' },
  { name: 'Portrait', width: 600, height: 800, ratio: '3:4' },
  { name: 'Wide', width: 1600, height: 900, ratio: '16:9' },
  { name: 'Ultra Wide', width: 2560, height: 1080, ratio: '21:9' },
  { name: 'Mobile', width: 375, height: 667, ratio: '9:16' },
  { name: 'Tablet', width: 768, height: 1024, ratio: '3:4' },
  { name: 'Desktop', width: 1920, height: 1080, ratio: '16:9' },
];

const ratioPresets = [
  '1:1', '2:1', '3:1', '3:2', '4:3', '7:4',
  '8:7', '16:9', '1:2', '1:3', '2:3', '3:4',
  '4:7', '7:8', '9:16'
];

const MAX_CANVAS_DIMENSION = 8000;
const MIN_CANVAS_DIMENSION = 1;
const PERFORMANCE_DIMENSION_THRESHOLD = 4000;
const PERFORMANCE_AREA_THRESHOLD = 24000000;

type DimensionKey = 'width' | 'height';
type DimensionErrors = Partial<Record<DimensionKey, string>>;

export function CanvasSection({ canvas, onCanvasChange, onGradientStateChange }: CanvasSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('Choose Template');
  const [dimensionErrors, setDimensionErrors] = useState<DimensionErrors>({});

  const clampDimension = (value: number) => {
    if (!Number.isFinite(value)) {
      return MIN_CANVAS_DIMENSION;
    }
    const rounded = Math.round(value);
    return Math.min(MAX_CANVAS_DIMENSION, Math.max(MIN_CANVAS_DIMENSION, rounded));
  };

  const applyCanvasUpdate = (updates: Partial<CanvasState>) => {
    const nextState = { ...canvas, ...updates };

    const clampedWidth = clampDimension(nextState.width);
    const clampedHeight = clampDimension(nextState.height);

    const nextCanvas: CanvasState = {
      ...nextState,
      width: clampedWidth,
      height: clampedHeight,
    };

    setDimensionErrors((prev) => {
      const next: DimensionErrors = { ...prev };

      if (clampedWidth !== nextState.width) {
        next.width =
          nextState.width > MAX_CANVAS_DIMENSION
            ? `Maximum size is ${MAX_CANVAS_DIMENSION}px`
            : `Minimum size is ${MIN_CANVAS_DIMENSION}px`;
      } else if (updates.width !== undefined) {
        delete next.width;
      }

      if (clampedHeight !== nextState.height) {
        next.height =
          nextState.height > MAX_CANVAS_DIMENSION
            ? `Maximum size is ${MAX_CANVAS_DIMENSION}px`
            : `Minimum size is ${MIN_CANVAS_DIMENSION}px`;
      } else if (updates.height !== undefined) {
        delete next.height;
      }

      return next;
    });

    onCanvasChange(nextCanvas);
  };

  const updateDimension = (key: DimensionKey, rawValue: string) => {
    const trimmedValue = rawValue.trim();

    if (trimmedValue === '') {
      setDimensionErrors((prev) => ({ ...prev, [key]: 'Enter a numeric value' }));
      return;
    }

    const numericValue = Number(trimmedValue);

    if (!Number.isFinite(numericValue)) {
      setDimensionErrors((prev) => ({ ...prev, [key]: 'Enter a numeric value' }));
      return;
    }

    applyCanvasUpdate({ [key]: numericValue } as Partial<CanvasState>);
  };

  const applyTemplate = (template: any) => {
    applyCanvasUpdate({
      width: template.width,
      height: template.height,
      ratio: template.ratio,
    });
    setSelectedTemplate(template.name);
  };

  const applyRatio = (ratio: string) => {
    const [w, h] = ratio.split(':').map(Number);
    const baseSize = 800;
    const width = Math.round(baseSize * (w / Math.max(w, h)));
    const height = Math.round(baseSize * (h / Math.max(w, h)));
    
    applyCanvasUpdate({
      width,
      height,
      ratio,
    });
  };

  const toggleOrientation = () => {
    applyCanvasUpdate({
      width: canvas.height,
      height: canvas.width,
      ratio: canvas.ratio.split(':').reverse().join(':'),
    });
  };

  const scalePresets = [
    { name: '0.5x', value: 0.5 },
    { name: '2x', value: 2 },
  ];

  const pixelCount = canvas.width * canvas.height;
  const formattedPixelCount = new Intl.NumberFormat().format(pixelCount);
  const isLargeCanvas =
    canvas.width >= PERFORMANCE_DIMENSION_THRESHOLD ||
    canvas.height >= PERFORMANCE_DIMENSION_THRESHOLD ||
    pixelCount >= PERFORMANCE_AREA_THRESHOLD;
  const hasDimensionErrors = Boolean(dimensionErrors.width || dimensionErrors.height);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Monitor className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Canvas Size</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Dimensions</h4>
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  const template = [...socialTemplates, ...standardTemplates].find(t => t.name === e.target.value);
                  if (template) applyTemplate(template);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="Choose Template">Choose Template</option>
                <optgroup label="Social Media">
                  {socialTemplates.map((template, index) => (
                    <option key={index} value={template.name}>
                      {template.platform} - {template.name} ({template.width}×{template.height})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Standard">
                  {standardTemplates.map((template, index) => (
                    <option key={index} value={template.name}>
                      {template.name} ({template.width}×{template.height})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input
                type="number"
                value={canvas.width}
                min={MIN_CANVAS_DIMENSION}
                max={MAX_CANVAS_DIMENSION}
                inputMode="numeric"
                aria-invalid={dimensionErrors.width ? 'true' : 'false'}
                aria-describedby={dimensionErrors.width ? 'canvas-width-error' : undefined}
                onChange={(e) => updateDimension('width', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:border-transparent ${
                  dimensionErrors.width
                    ? 'border-red-300 focus:ring-red-500 focus:ring-opacity-50'
                    : 'border-gray-300 focus:ring-purple-500'
                }`}
              />
              {dimensionErrors.width && (
                <p className="mt-1 text-xs text-red-600" id="canvas-width-error">
                  {dimensionErrors.width}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="number"
                value={canvas.height}
                min={MIN_CANVAS_DIMENSION}
                max={MAX_CANVAS_DIMENSION}
                inputMode="numeric"
                aria-invalid={dimensionErrors.height ? 'true' : 'false'}
                aria-describedby={dimensionErrors.height ? 'canvas-height-error' : undefined}
                onChange={(e) => updateDimension('height', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:border-transparent ${
                  dimensionErrors.height
                    ? 'border-red-300 focus:ring-red-500 focus:ring-opacity-50'
                    : 'border-gray-300 focus:ring-purple-500'
                }`}
              />
              {dimensionErrors.height && (
                <p className="mt-1 text-xs text-red-600" id="canvas-height-error">
                  {dimensionErrors.height}
                </p>
              )}
            </div>
          </div>

          {hasDimensionErrors && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="space-y-1">
                <div>
                  Some canvas dimensions were adjusted to stay within the supported range (
                  {MIN_CANVAS_DIMENSION}px - {MAX_CANVAS_DIMENSION}px).
                </div>
                <div className="text-[11px] text-red-600">
                  Check the highlighted fields above and update them if needed.
                </div>
              </div>
            </div>
          )}

          {isLargeCanvas && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="space-y-1">
                <div>Large canvas sizes may impact rendering and export performance.</div>
                <div className="text-[11px] text-amber-600">
                  Current size: {canvas.width}×{canvas.height}px ({formattedPixelCount} pixels)
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Scale</label>
              <div className="flex space-x-1">
                {scalePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyCanvasUpdate({ scale: preset.value })}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      canvas.scale === preset.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={canvas.scale}
              onChange={(e) => applyCanvasUpdate({ scale: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center text-sm text-gray-600">{canvas.scale}x</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ratio</label>
            <div className="grid grid-cols-5 gap-1">
              {ratioPresets.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => applyRatio(ratio)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    canvas.ratio === ratio
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={toggleOrientation}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              <span>Vertical Orientation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
