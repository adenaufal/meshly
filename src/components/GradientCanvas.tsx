import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { GradientState } from '../types/gradient';

interface GradientCanvasProps {
  gradientState: GradientState;
  onColorMove: (id: string, x: number, y: number) => void;
  onColorSelect: (id: string | null) => void;
  selectedColorId: string | null;
}

export const GradientCanvas = forwardRef<HTMLDivElement, GradientCanvasProps>(
  ({ gradientState, onColorMove, onColorSelect, selectedColorId }, ref) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);

    const generateMeshGradient = useCallback(() => {
      const { colors, filters } = gradientState;
      
      // Create radial gradients for each color point
      const radialGradients = colors.map((color, index) => {
        const opacity = 0.7 - (index * 0.1);
        return `radial-gradient(circle at ${color.x}% ${color.y}%, ${color.color}${Math.round(opacity * 255).toString(16)} 0%, transparent 50%)`;
      });

      return radialGradients.join(', ');
    }, [gradientState]);

    const generateFilters = useCallback(() => {
      const { filters } = gradientState;
      let filterStr = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        hue-rotate(${filters.hue}deg)
        blur(${filters.blur}px)
      `;

      // Add grain effect if enabled
      if (filters.grain > 0) {
        // This is a simplified grain effect - in a real implementation,
        // you'd overlay a noise texture or SVG pattern
        filterStr += ` opacity(${1 - filters.grain / 200})`;
      }

      return filterStr;
    }, [gradientState.filters]);

    const handleMouseDown = (colorId: string, e: React.MouseEvent) => {
      if (!gradientState.adjustColorPosition) return;
      e.preventDefault();
      setIsDragging(colorId);
      onColorSelect(colorId);
    };

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (!isDragging || !canvasRef.current || !gradientState.adjustColorPosition) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      onColorMove(isDragging, x, y);
    }, [isDragging, onColorMove, gradientState.adjustColorPosition]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(null);
    }, []);

    const handleZoomIn = () => {
      setZoom(prev => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
      setZoom(prev => Math.max(prev - 0.2, 0.5));
    };

    const canvasStyle = {
      width: gradientState.canvas.width * gradientState.canvas.scale * zoom,
      height: gradientState.canvas.height * gradientState.canvas.scale * zoom,
      maxWidth: '100%',
      maxHeight: 'calc(100vh - 300px)',
    };

    return (
      <div className="flex flex-col space-y-4">
        <div className="overflow-auto max-w-full max-h-full">
          <div
            ref={ref}
            className="relative bg-white rounded-xl shadow-lg overflow-hidden"
            style={canvasStyle}
          >
            <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 p-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-md">
              <button
                onClick={handleZoomOut}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600 min-w-[40px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <div
              ref={canvasRef}
              className={`absolute inset-0 ${gradientState.adjustColorPosition ? 'cursor-crosshair' : ''}`}
              style={{
                background: generateMeshGradient(),
                filter: generateFilters(),
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {gradientState.adjustColorPosition && gradientState.colors.map((color) => (
                <div
                  key={color.id}
                  className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing transition-all ${
                    selectedColorId === color.id
                      ? 'ring-2 ring-purple-500 scale-125'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: color.color,
                    left: `${color.x}%`,
                    top: `${color.y}%`,
                  }}
                  onMouseDown={(e) => handleMouseDown(color.id, e)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>
            {gradientState.canvas.width} × {gradientState.canvas.height}
          </span>
          <span>•</span>
          <span>{gradientState.canvas.scale}x scale</span>
          <span>•</span>
          <span>{gradientState.colors.length} colors</span>
          <span>•</span>
          <span>{Math.round(zoom * 100)}% zoom</span>
        </div>
      </div>
    );
  }

);

GradientCanvas.displayName = 'GradientCanvas';