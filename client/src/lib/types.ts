export type ImageContextType = {
  image: string | null;
  setImage: (image: string | null) => void;
  brightness: number;
  setBrightness: (brightness: number) => void;
  contrast: number;
  setContrast: (contrast: number) => void;
  saturation: number;
  setSaturation: (saturation: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
  filename: string | null;
  setFilename: (filename: string | null) => void;
  theme: string | null;
  setTheme: (theme: string | null) => void;
}