import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { X, Download, Copy, Check, Loader2, AlertTriangle } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { GradientState, ColorPoint } from '../types/gradient';
import { useNotifications } from './NotificationCenter';

interface ExportModalProps {
  gradientState: GradientState;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

interface ExportComputation {
  preview: string;
  payload: string | null;
  error: string | null;
  colors: ColorPoint[];
  width: number;
  height: number;
}

const DPI_OPTIONS = [72, 150, 300] as const;

const clampNumber = (value: number, min: number, max: number, fallback: number) => {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
};

export function ExportModal({ gradientState, onClose, canvasRef }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'css' | 'svg' | 'png'>('css');
  const [copied, setCopied] = useState(false);
  const [dpi, setDpi] = useState<(typeof DPI_OPTIONS)[number]>(150);
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const { notify } = useNotifications();

  const exportResult = useMemo<ExportComputation>(() => {
    const fallback: ExportComputation = {
      preview: '',
      payload: null,
      error: null,
      colors: [],
      width: gradientState.canvas.width,
      height: gradientState.canvas.height,
    };

    try {
      const sanitizedColors = gradientState.colors
        .map((color) => {
          if (!color || typeof color.color !== 'string') {
            return null;
          }

          const hex = color.color.trim();
          if (!hex) {
            return null;
          }

          const safeX = Number.isFinite(color.x) ? Math.min(Math.max(color.x, 0), 100) : 50;
          const safeY = Number.isFinite(color.y) ? Math.min(Math.max(color.y, 0), 100) : 50;

          return {
            ...color,
            color: hex,
            x: safeX,
            y: safeY,
          } as ColorPoint;
        })
        .filter((value): value is ColorPoint => Boolean(value));

      const { canvas, filters } = gradientState;

      if (!sanitizedColors.length) {
        return {
          ...fallback,
          preview: '/* Add at least one valid color before exporting. */',
          error: 'Add at least one valid color before exporting.',
        };
      }

      if (
        !Number.isFinite(canvas.width) ||
        !Number.isFinite(canvas.height) ||
        canvas.width <= 0 ||
        canvas.height <= 0
      ) {
        return {
          ...fallback,
          preview: '/* Canvas dimensions must be positive numbers to export. */',
          error: 'Canvas dimensions must be positive numbers.',
        };
      }

      if (exportFormat === 'png') {
        return {
          ...fallback,
          preview: 'PNG exports are generated directly from the canvas preview.',
          colors: sanitizedColors,
          width: canvas.width,
          height: canvas.height,
        };
      }

      const brightness = clampNumber(filters.brightness, 0, 200, 100);
      const contrast = clampNumber(filters.contrast, 0, 200, 100);
      const saturation = clampNumber(filters.saturation, 0, 200, 100);
      const hue = clampNumber(filters.hue, -360, 360, 0);
      const blur = clampNumber(filters.blur, 0, 50, 0);

      if (exportFormat === 'css') {
        const radialGradients = sanitizedColors.map((color, index) => {
          const opacity = Math.max(0.2, Math.min(1, 0.75 - index * 0.1));
          const alphaHex = Math.round(opacity * 255)
            .toString(16)
            .padStart(2, '0');

          return `radial-gradient(circle at ${color.x}% ${color.y}%, ${color.color}${alphaHex} 0%, transparent 50%)`;
        });

        const backgroundImage = radialGradients.join(', ');
        const filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`;

        const css = `.mesh-gradient {
  background: ${backgroundImage};
  filter: ${filterStr};
  width: ${canvas.width}px;
  height: ${canvas.height}px;
}`;

        return {
          preview: css,
          payload: css,
          error: null,
          colors: sanitizedColors,
          width: canvas.width,
          height: canvas.height,
        };
      }

      if (exportFormat === 'svg') {
        const defs = sanitizedColors
          .map(
            (color, index) => `    <radialGradient id="gradient-${index}" cx="${color.x}%" cy="${color.y}%" r="50%">
      <stop offset="0%" stop-color="${color.color}" stop-opacity="0.7" />
      <stop offset="100%" stop-color="${color.color}" stop-opacity="0" />
    </radialGradient>`,
          )
          .join('\n');

        const rects = sanitizedColors
          .map((_, index) => `  <rect width="100%" height="100%" fill="url(#gradient-${index})" />`)
          .join('\n');

        const svg = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
${defs}
  </defs>
${rects}
</svg>`;

        return {
          preview: svg,
          payload: svg,
          error: null,
          colors: sanitizedColors,
          width: canvas.width,
          height: canvas.height,
        };
      }

      return {
        ...fallback,
        error: 'Unsupported export format selected.',
      };
    } catch (error) {
      console.error('Failed to prepare export data', error);
      return {
        ...fallback,
        preview: '/* Failed to generate export preview. Please try again. */',
        error: 'Failed to generate export preview. Please try again.',
      };
    }
  }, [exportFormat, gradientState]);

  useEffect(() => {
    setCopied(false);
    setExportError(null);
  }, [exportFormat]);

  const copyDisabled = exportFormat !== 'png' && !exportResult.payload;
  const downloadDisabled = isExporting || (exportFormat !== 'png' && !exportResult.payload);
  const activeError = exportError ?? exportResult.error;

  const handleCopy = useCallback(async () => {
    const textToCopy = exportFormat === 'png' ? exportResult.preview : exportResult.payload;

    if (!textToCopy) {
      const message = exportResult.error ?? 'There is no content available to copy yet.';
      setExportError(message);
      notify({ message, kind: 'error' });
      return;
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== 'function'
    ) {
      const message = 'Clipboard access is not available in this environment.';
      setExportError(message);
      notify({ message, kind: 'error' });
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setExportError(null);
      notify({ message: 'Copied to clipboard.', kind: 'success' });
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy export content', error);
      const message = 'Unable to copy to clipboard. Check your browser permissions.';
      setExportError(message);
      notify({ message, kind: 'error' });
    }
  }, [exportFormat, exportResult.payload, exportResult.preview, exportResult.error, notify]);

  const downloadFile = useCallback((content: string | Blob, filename: string, type: string) => {
    const blob = typeof content === 'string' ? new Blob([content], { type }) : content;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handlePNGExport = useCallback(async () => {
    const container = canvasRef.current;

    if (!container) {
      const message = 'Canvas is not available for export.';
      setExportError(message);
      notify({ message, kind: 'error' });
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      const pixelRatio = Math.max(1, dpi / 72);
      const backgroundColor = transparentBackground ? undefined : '#ffffff';

      const blob = await toBlob(container, {
        pixelRatio,
        backgroundColor,
        filter: (node) => {
          if (!(node instanceof Element)) {
            return true;
          }

          return !node.hasAttribute('data-export-ignore');
        },
      });

      if (!blob) {
        throw new Error('No image data was generated from the canvas.');
      }

      downloadFile(blob, `mesh-gradient-${dpi}dpi.png`, 'image/png');
      notify({ message: `PNG exported at ${dpi} DPI.`, kind: 'success' });
    } catch (error) {
      console.error('PNG export failed', error);
      const message = 'Failed to export PNG. Please try again.';
      setExportError(message);
      notify({ message, kind: 'error' });
    } finally {
      setIsExporting(false);
    }
  }, [canvasRef, dpi, downloadFile, notify, transparentBackground]);

  const handleExport = useCallback(async () => {
    if (exportFormat === 'png') {
      await handlePNGExport();
      return;
    }

    if (!exportResult.payload) {
      const message =
        exportResult.error ?? 'There is no exportable content available. Adjust your gradient and try again.';
      setExportError(message);
      notify({ message, kind: 'error' });
      return;
    }

    const isCSS = exportFormat === 'css';
    const filename = isCSS ? 'mesh-gradient.css' : 'mesh-gradient.svg';
    const mimeType = isCSS ? 'text/css' : 'image/svg+xml';

    try {
      downloadFile(exportResult.payload, filename, mimeType);
      setExportError(null);
      notify({ message: `${exportFormat.toUpperCase()} exported successfully.`, kind: 'success' });
    } catch (error) {
      console.error('Failed to export gradient', error);
      const message = 'Failed to export file. Please try again.';
      setExportError(message);
      notify({ message, kind: 'error' });
    }
  }, [downloadFile, exportFormat, exportResult.error, exportResult.payload, handlePNGExport, notify]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold text-gray-900">Export Gradient</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-gray-600"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {activeError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{activeError}</span>
            </div>
          )}

          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            {(['css', 'svg', 'png'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  exportFormat === format
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                type="button"
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>

          {exportFormat === 'png' && (
            <div className="space-y-4 rounded-lg border border-purple-100 bg-purple-50/50 p-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Quality (DPI)</label>
                <div className="flex items-center space-x-2">
                  {DPI_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => setDpi(option)}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        dpi === option
                          ? 'border-purple-500 bg-white text-purple-600 shadow-sm'
                          : 'border-transparent bg-white/70 text-gray-700 hover:border-purple-300 hover:text-purple-600'
                      }`}
                      type="button"
                    >
                      {option} DPI
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center space-x-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  checked={transparentBackground}
                  onChange={(event) => setTransparentBackground(event.target.checked)}
                />
                <span>Export with transparent background</span>
              </label>

              {isExporting && (
                <div className="flex items-center space-x-2 text-sm font-medium text-purple-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Preparing PNG export...</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">
                {exportFormat === 'png' ? 'Export Details' : 'Code Preview'}
              </h3>
              <button
                onClick={handleCopy}
                disabled={copyDisabled}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={copyDisabled}
                type="button"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : exportFormat === 'png' ? 'Copy Details' : 'Copy'}</span>
              </button>
            </div>

            <pre className="max-h-64 overflow-auto rounded-lg bg-gray-50 p-4 text-sm font-mono">
              <code>{exportResult.preview}</code>
            </pre>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-900"
              type="button"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={downloadDisabled}
              aria-disabled={downloadDisabled}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-white transition-colors ${
                downloadDisabled ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              }`}
              type="button"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>{isExporting ? 'Exporting...' : `Download ${exportFormat.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
