export interface ColorPoint {
  id: string;
  color: string;
  x: number; // percentage
  y: number; // percentage
}

export interface FilterState {
  brightness: number; // 0-200
  contrast: number; // 0-200
  saturation: number; // 0-200
  hue: number; // -180 to 180
  blur: number; // 0-10
  grain: number; // 0-100
  grainType: 'noise' | 'svg' | 'perlin';
  grainBlendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion';
}

export interface CanvasState {
  width: number;
  height: number;
  scale: number;
  ratio: string;
}

export type AnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface AnimationState {
  isPlaying: boolean;
  speed: number; // multiplier
  duration: number; // seconds
  easing: AnimationEasing;
}

export interface GradientState {
  colors: ColorPoint[];
  filters: FilterState;
  canvas: CanvasState;
  animation: AnimationState;
  blendMode: string;
  adjustColorPosition: boolean;
}

export interface Template {
  name: string;
  colors: ColorPoint[];
  width: number;
  height: number;
}

export interface ColorPreset {
  name: string;
  colors: string[];
}
