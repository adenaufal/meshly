import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Loader2, AlertTriangle } from "lucide-react";
import { GradientState, ColorPoint } from "../types/gradient";

interface GradientCanvasProps {
  gradientState: GradientState;
  onColorMove: (id: string, x: number, y: number) => void;
  onColorSelect: (id: string | null) => void;
  selectedColorId: string | null;
  isBusy: boolean;
}

export const GradientCanvas = forwardRef<HTMLDivElement, GradientCanvasProps>(
  ({ gradientState, onColorMove, onColorSelect, selectedColorId, isBusy }, ref) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [renderError, setRenderError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    const canvasRendering = useMemo(() => {
      const { colors, filters, canvas } = gradientState;

      const fallback = {
        background: "none",
        filter: "none",
        colors: [] as ColorPoint[],
        width: Number.isFinite(canvas.width) ? canvas.width : 0,
        height: Number.isFinite(canvas.height) ? canvas.height : 0,
        error: null as string | null,
        recoverable: false,
      };

      try {
        if (!Array.isArray(colors) || colors.length === 0) {
          return { ...fallback, error: "Add at least one color to render the canvas." };
        }

        const sanitizedColors = colors
          .map((color) => {
            if (!color || typeof color.color !== "string") {
              return null;
            }

            const colorValue = color.color.trim();

            if (!colorValue) {
              return null;
            }

            const safeX = Number.isFinite(color.x) ? Math.min(Math.max(color.x, 0), 100) : 50;
            const safeY = Number.isFinite(color.y) ? Math.min(Math.max(color.y, 0), 100) : 50;

            return {
              ...color,
              color: colorValue,
              x: safeX,
              y: safeY,
            } as ColorPoint;
          })
          .filter((color): color is ColorPoint => Boolean(color));

        if (!sanitizedColors.length) {
          return { ...fallback, error: "No valid colors available for rendering." };
        }

        if (
          !Number.isFinite(canvas.width) ||
          !Number.isFinite(canvas.height) ||
          canvas.width <= 0 ||
          canvas.height <= 0
        ) {
          return { ...fallback, error: "Canvas dimensions must be positive numbers." };
        }

        const clamp = (value: number, min: number, max: number, fallbackValue: number) => {
          if (!Number.isFinite(value)) {
            return fallbackValue;
          }

          return Math.min(max, Math.max(min, value));
        };

        const sanitizedFilters = {
          brightness: clamp(filters.brightness, 0, 200, 100),
          contrast: clamp(filters.contrast, 0, 200, 100),
          saturation: clamp(filters.saturation, 0, 200, 100),
          hue: clamp(filters.hue, -360, 360, 0),
          blur: clamp(filters.blur, 0, 50, 0),
          grain: clamp(filters.grain, 0, 100, 0),
          grainType: filters.grainType,
          grainBlendMode: filters.grainBlendMode,
        };

        const radialGradients = sanitizedColors.map((color, index) => {
          const opacity = Math.max(0.2, Math.min(1, 0.75 - index * 0.1));
          const alphaHex = Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0");

          return `radial-gradient(circle at ${color.x}% ${color.y}%, ${color.color}${alphaHex} 0%, transparent 50%)`;
        });

        const background = radialGradients.join(", ");

        const filterSegments = [
          `brightness(${sanitizedFilters.brightness}%)`,
          `contrast(${sanitizedFilters.contrast}%)`,
          `saturate(${sanitizedFilters.saturation}%)`,
          `hue-rotate(${sanitizedFilters.hue}deg)`,
          `blur(${sanitizedFilters.blur}px)`,
        ];

        if (sanitizedFilters.grain > 0) {
          filterSegments.push("url(#grainFilter)");
        }

        return {
          background,
          filter: filterSegments.join(" "),
          colors: sanitizedColors,
          width: canvas.width,
          height: canvas.height,
          error: null,
          recoverable: false,
        };
      } catch (error) {
        console.error("Failed to compute gradient styles", error);
        return {
          ...fallback,
          error: "Unexpected rendering error. Try refreshing the canvas.",
          recoverable: true,
        };
      }
    }, [gradientState, retryKey]);

    useEffect(() => {
      setRenderError((prev) => {
        if (canvasRendering.error && canvasRendering.error !== prev) {
          return canvasRendering.error;
        }

        if (!canvasRendering.error && prev !== null) {
          return null;
        }

        return prev;
      });
    }, [canvasRendering.error]);

    const handleRetryRender = useCallback(() => {
      setRenderError(null);
      setRetryKey((prev) => prev + 1);
    }, []);

    const handleMouseDown = (colorId: string, event: React.MouseEvent) => {
      if (!gradientState.adjustColorPosition) {
        return;
      }
      event.preventDefault();
      setIsDragging(colorId);
      onColorSelect(colorId);
    };

    const handleMouseMove = useCallback(
      (event: React.MouseEvent) => {
        if (!isDragging || !canvasRef.current || !gradientState.adjustColorPosition) {
          return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));

        onColorMove(isDragging, x, y);
      },
      [gradientState.adjustColorPosition, isDragging, onColorMove],
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(null);
    }, []);

    const handleZoomIn = () => {
      setZoom((prev) => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
      setZoom((prev) => Math.max(prev - 0.2, 0.5));
    };

    const safeScale = Number.isFinite(gradientState.canvas.scale)
      ? Math.min(Math.max(gradientState.canvas.scale, 0.1), 4)
      : 1;
    const formattedScale = Math.round(safeScale * 100) / 100;

    const canvasStyle = {
      width: canvasRendering.width * safeScale * zoom,
      height: canvasRendering.height * safeScale * zoom,
      maxWidth: "100%",
      maxHeight: "calc(100vh - 300px)",
    };

    return (
      <div className="flex flex-col space-y-4">
        <div className="overflow-auto max-w-full max-h-full">
          <div
            ref={ref}
            aria-busy={isBusy}
            className="relative overflow-hidden rounded-xl bg-white shadow-lg"
            style={canvasStyle}
          >
            <svg className="pointer-events-none absolute" style={{ width: 0, height: 0 }}>
              <defs>
                <filter id="grainFilter">
                  <feTurbulence
                    type={gradientState.filters.grainType === 'noise' ? 'turbulence' : 'fractalNoise'}
                    baseFrequency={`${0.01 + gradientState.filters.grain * 0.001}`}
                    numOctaves={`${Math.floor(1 + gradientState.filters.grain * 0.05)}`}
                    seed={`${Math.random() * 1000}`}
                    result="noise"
                  />
                  <feColorMatrix
                    type="matrix"
                    values={`1 0 0 0 0
0 1 0 0 0
0 0 1 0 0
0 0 0 ${gradientState.filters.grain * 0.05} 0`}
                  />
                  <feBlend
                    in="SourceGraphic"
                    in2="noise"
                    mode={gradientState.filters.grainBlendMode}
                  />
                </filter>
              </defs>
            </svg>

            {isBusy && !renderError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm text-purple-600 pointer-events-none">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="mt-2 text-sm font-medium">Rendering...</span>
              </div>
            )}

            {renderError && (
              <div
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/85 px-6 text-center backdrop-blur-sm"
                data-export-ignore="true"
              >
                <AlertTriangle className="mb-3 h-6 w-6 text-red-500" />
                <p className="text-sm font-semibold text-red-600">{renderError}</p>
                {canvasRendering.recoverable && (
                  <button
                    type="button"
                    onClick={handleRetryRender}
                    className="mt-4 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            <div
              className="absolute top-4 right-4 z-10 flex items-center space-x-2 rounded-lg bg-white/70 p-2 shadow-md backdrop-blur-sm"
              data-export-ignore="true"
            >
              <button
                onClick={handleZoomOut}
                className="rounded-lg p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                title="Zoom Out"
                type="button"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-[40px] text-center text-xs text-gray-600">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="rounded-lg p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                title="Zoom In"
                type="button"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={canvasRef}
              className={`absolute inset-0 ${gradientState.adjustColorPosition ? 'cursor-crosshair' : ''}`}
              data-export-target="gradient"
              style={{
                background: canvasRendering.background,
                filter: canvasRendering.filter,
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {!renderError &&
                gradientState.adjustColorPosition &&
                canvasRendering.colors.map((color) => (
                  <div
                    key={color.id}
                    className={`absolute -ml-2 -mt-2 h-4 w-4 rounded-full border-2 border-white shadow-lg transition-all ${
                      selectedColorId === color.id
                        ? 'ring-2 ring-purple-500 scale-125 cursor-grab'
                        : 'cursor-grab hover:scale-110 active:cursor-grabbing'
                    }`}
                    data-export-ignore="true"
                    style={{
                      backgroundColor: color.color,
                      left: `${color.x}%`,
                      top: `${color.y}%`,
                    }}
                    onMouseDown={(event) => handleMouseDown(color.id, event)}
                  />
                ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span>
            {Math.round(canvasRendering.width)} x {Math.round(canvasRendering.height)} px
          </span>
          <span>|</span>
          <span>{formattedScale}x scale</span>
          <span>|</span>
          <span>{canvasRendering.colors.length} colors</span>
          <span>|</span>
          <span>{Math.round(zoom * 100)}% zoom</span>
        </div>
      </div>
    );
  },
);

GradientCanvas.displayName = 'GradientCanvas';
