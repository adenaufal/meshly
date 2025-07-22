import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GradientCanvas } from './components/GradientCanvas';
import { ExportModal } from './components/ExportModal';
import { GradientState, ColorPoint, FilterState, CanvasState } from './types/gradient';

const initialColors: ColorPoint[] = [
  { id: '1', color: '#ff6b9d', x: 20, y: 20 },
  { id: '2', color: '#4ecdc4', x: 80, y: 20 },
  { id: '3', color: '#45b7d1', x: 20, y: 80 },
  { id: '4', color: '#f9ca24', x: 80, y: 80 },
];

const initialFilters: FilterState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  grain: 0,
  grainType: 'noise',
  grainBlendMode: 'normal',
};

const initialCanvas: CanvasState = {
  width: 800,
  height: 600,
  scale: 1,
  ratio: '4:3',
};

function App() {
  const [gradientState, setGradientState] = useState<GradientState>({
    colors: initialColors,
    filters: initialFilters,
    canvas: initialCanvas,
    animationSpeed: 0,
    blendMode: 'normal',
    adjustColorPosition: false,
  });

  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const updateColors = useCallback((colors: ColorPoint[]) => {
    setGradientState(prev => ({ ...prev, colors }));
  }, []);

  const updateFilters = useCallback((filters: FilterState) => {
    setGradientState(prev => ({ ...prev, filters }));
  }, []);

  const updateCanvas = useCallback((canvas: CanvasState) => {
    setGradientState(prev => ({ ...prev, canvas }));
  }, []);

  const updateGradientState = useCallback((updates: Partial<GradientState>) => {
    setGradientState(prev => ({ ...prev, ...updates }));
  }, []);

  const randomizeGradient = useCallback(() => {
    const newColors = gradientState.colors.map(color => ({
      ...color,
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    updateColors(newColors);
  }, [gradientState.colors, updateColors]);

  return (
    <div className="h-screen bg-gray-50 font-lato flex flex-col overflow-hidden">
      <Header 
        onExport={() => setShowExportModal(true)}
        onRandomize={randomizeGradient}
      />
      
      <div className="flex flex-1 min-h-0">
        <Sidebar
          gradientState={gradientState}
          onColorsChange={updateColors}
          onFiltersChange={updateFilters}
          onCanvasChange={updateCanvas}
          onGradientStateChange={updateGradientState}
          selectedColorId={selectedColorId}
          onColorSelect={setSelectedColorId}
        />
        
        <main className="flex-1 p-6 flex flex-col relative">
          <GradientCanvas
            ref={canvasRef}
            gradientState={gradientState}
            onColorMove={(id, x, y) => {
              const newColors = gradientState.colors.map(color =>
                color.id === id ? { ...color, x, y } : color
              );
              updateColors(newColors);
            }}
            onColorSelect={setSelectedColorId}
            selectedColorId={selectedColorId}
          />
          
          <div className="absolute bottom-6 left-6 text-center">
            <p className="text-sm text-gray-500">
              Created by{' '}
              <a 
                href="https://github.com/adenaufal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 underline"
              >
                @adenaufal
              </a>
            </p>
          </div>
        </main>
      </div>

      {showExportModal && (
        <ExportModal
          gradientState={gradientState}
          onClose={() => setShowExportModal(false)}
          canvasRef={canvasRef}
        />
      )}
    </div>
  );
}

export default App;