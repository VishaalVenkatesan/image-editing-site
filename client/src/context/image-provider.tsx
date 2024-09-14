import { useState, createContext, useContext } from "react";
import { ImageContextType } from "../lib/types"

  const ImageContext = createContext<ImageContextType | null>(null);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [image, setImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [filename, setFilename] = useState<string | null>(null);
  const [theme, setTheme] = useState<string | null>('light');

  return (
    <ImageContext.Provider value={{
      image, setImage,
      brightness, setBrightness,
      contrast, setContrast,
      saturation, setSaturation,
      rotation, setRotation,
      filename, setFilename,
      theme, setTheme
    }}>
      {children}
    </ImageContext.Provider>
  );
};

// Custom hook to use the context
export const useImage = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
};