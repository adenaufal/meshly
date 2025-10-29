import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Play, Pause, Sparkles } from 'lucide-react';
import { AnimationState, ColorPoint } from '../../types/gradient';

interface AnimationSectionProps {
  animation: AnimationState;
  colors: ColorPoint[];
  onAnimationChange: (animation: AnimationState) => void;
}

const easingLabels: Record<AnimationState['easing'], string> = {
  linear: 'Linear',
  ease: 'Ease',
  'ease-in': 'Ease In',
  'ease-out': 'Ease Out',
  'ease-in-out': 'Ease In-Out',
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const applyEasing = (t: number, easing: AnimationState['easing']) => {
  switch (easing) {
    case 'ease-in':
      return t * t;
    case 'ease-out':
      return 1 - Math.pow(1 - t, 2);
    case 'ease-in-out':
    case 'ease':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case 'linear':
    default:
      return t;
  }
};

export function AnimationSection({
  animation,
  colors,
  onAnimationChange,
}: AnimationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>();
  const lastFrameRef = useRef<number>();

  const updateAnimation = (updates: Partial<AnimationState>) => {
    onAnimationChange({ ...animation, ...updates });
  };

  useEffect(() => {
    if (!animation.isPlaying) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      lastFrameRef.current = undefined;
      setProgress(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (lastFrameRef.current !== undefined) {
        const delta = timestamp - lastFrameRef.current;
        const durationMs = Math.max(200, animation.duration * 1000);
        const speed = Math.max(0, animation.speed);

        if (speed > 0) {
          setProgress((prev) => {
            const increment = (delta * speed) / durationMs;
            const next = prev + increment;
            return next - Math.floor(next);
          });
        }
      }

      lastFrameRef.current = timestamp;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      lastFrameRef.current = undefined;
    };
  }, [animation.isPlaying, animation.duration, animation.speed]);

  useEffect(
    () => () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    },
    []
  );

  const easedProgress = useMemo(
    () => applyEasing(progress % 1, animation.easing),
    [progress, animation.easing]
  );

  const animatedColors = useMemo(() => {
    if (!colors.length) {
      return colors;
    }

    const baseAmplitude = 6 + animation.speed * 4;

    return colors.map((color, index) => {
      const angle = (index / Math.max(colors.length, 1)) * Math.PI * 2;
      const phase = easedProgress * Math.PI * 2;
      const amplitude = baseAmplitude * (0.6 + (index / Math.max(colors.length - 1, 1)) * 0.4);

      const offsetX = Math.cos(angle + phase) * amplitude;
      const offsetY = Math.sin(angle + phase) * amplitude;

      return {
        ...color,
        x: clamp(color.x + offsetX, 0, 100),
        y: clamp(color.y + offsetY, 0, 100),
      };
    });
  }, [colors, easedProgress, animation.speed]);

  const previewGradient = useMemo(() => {
    if (!animatedColors.length) {
      return '#f3f4f6';
    }

    const layers = animatedColors.map((color, index) => {
      const alpha = clamp(0.7 - index * 0.12, 0.25, 0.7);
      const alphaHex = Math.round(alpha * 255)
        .toString(16)
        .padStart(2, '0');
      return `radial-gradient(circle at ${color.x}% ${color.y}%, ${color.color}${alphaHex} 0%, transparent 55%)`;
    });

    return layers.join(', ');
  }, [animatedColors]);

  const handleSpeedChange = (value: number) => {
    updateAnimation({ speed: Number(value.toFixed(2)) });
  };

  const handleDurationChange = (value: number) => {
    updateAnimation({ duration: Math.round(value) });
  };

  const handleEasingChange = (value: AnimationState['easing']) => {
    updateAnimation({ easing: value });
  };

  const togglePlayback = () => {
    updateAnimation({ isPlaying: !animation.isPlaying });
  };

  const resetAnimation = () => {
    updateAnimation({
      isPlaying: false,
      speed: 1,
      duration: 8,
      easing: 'ease-in-out',
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Animation
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Preview
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {Math.round(progress * 100)}%
                </span>
                <button
                  onClick={togglePlayback}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  {animation.isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative h-40 rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
              <div
                className="absolute inset-0 transition-[background] duration-200 ease-linear"
                style={{ background: previewGradient }}
              />

              <div className="absolute inset-x-0 bottom-0 h-1 bg-purple-100">
                <div
                  className="h-full bg-purple-500 transition-[width] duration-150 ease-linear"
                  style={{ width: `${(progress % 1) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Speed</label>
                <span className="text-sm text-gray-500">
                  {animation.speed.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={animation.speed}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0.5x</span>
                <span>3x</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <span className="text-sm text-gray-500">
                  {animation.duration}s loop
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={animation.duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>2s</span>
                <span>20s</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Easing</label>
              <select
                value={animation.easing}
                onChange={(e) => handleEasingChange(e.target.value as AnimationState['easing'])}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                {Object.entries(easingLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-500">
              Animations loop continuously while playing.
            </span>
            <button
              onClick={resetAnimation}
              className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
