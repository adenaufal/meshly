import React, { useState, useCallback } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { GradientState } from '../types/gradient';

interface ExportModalProps {
  gradientState: GradientState;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export function ExportModal({ gradientState, onClose, canvasRef }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'css' | 'svg' | 'png'>('css');
  const [copied, setCopied] = useState(false);

  const generateCSS = useCallback(() => {
    const { colors, filters } = gradientState;
    
    const radialGradients = colors.map((color, index) => {
      const opacity = 0.7 - (index * 0.1);
      return `radial-gradient(circle at ${color.x}% ${color.y}%, ${color.color}${Math.round(opacity * 255).toString(16)} 0%, transparent 50%)`;
    });

    const backgroundImage = radialGradients.join(', ');
    const filterStr = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px)`;

    return `.mesh-gradient {
  background: ${backgroundImage};
  filter: ${filterStr};
  width: ${gradientState.canvas.width}px;
  height: ${gradientState.canvas.height}px;
}`;
  }, [gradientState]);

  const generateSVG = useCallback(() => {
    const { colors, canvas } = gradientState;

    const defs = colors.map((color, index) => `
      <radialGradient id="gradient-${index}" cx="${color.x}%" cy="${color.y}%" r="50%">
        <stop offset="0%" style="stop-color:${color.color};stop-opacity:0.7" />
        <stop offset="100%" style="stop-color:${color.color};stop-opacity:0" />
      </radialGradient>
    `).join('');

    const rects = colors.map((_, index) => 
      `<rect width="100%" height="100%" fill="url(#gradient-${index})" />`
    ).join('');

    return `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${defs}
  </defs>
  ${rects}
</svg>`;
  }, [gradientState]);

  const downloadFile = useCallback((content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleExport = useCallback(() => {
    switch (exportFormat) {
      case 'css':
        downloadFile(generateCSS(), 'mesh-gradient.css', 'text/css');
        break;
      case 'svg':
        downloadFile(generateSVG(), 'mesh-gradient.svg', 'image/svg+xml');
        break;
      case 'png':
        // For PNG export, we would need to use canvas API
        console.log('PNG export not implemented in this demo');
        break;
    }
  }, [exportFormat, generateCSS, generateSVG, downloadFile]);

  const getExportContent = () => {
    switch (exportFormat) {
      case 'css':
        return generateCSS();
      case 'svg':
        return generateSVG();
      case 'png':
        return 'PNG export requires server-side processing';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Export Gradient</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['css', 'svg', 'png'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  exportFormat === format
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Code Preview</h3>
              <button
                onClick={() => copyToClipboard(getExportContent())}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <pre className="bg-gray-50 rounded-lg p-4 text-sm overflow-auto max-h-64 font-mono">
              <code>{getExportContent()}</code>
            </pre>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download {exportFormat.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}