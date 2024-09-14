import React from "react";
import { Slider } from "@/components/ui/slider";
import { useImage } from "../context/image-provider"
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

export const ImageControls: React.FC = () => {
  const { brightness, setBrightness, contrast, setContrast, saturation, setSaturation, rotation, setRotation } = useImage();

  return (
  <Card className="w-full mt-5">
    <CardHeader>
      <div className="flex flex-row justify-between">
      <CardTitle>Image Controls</CardTitle>
      <Button 
      variant="outline"
      size="icon"
      onClick={() => {
        setBrightness(1);
        setContrast(1);
        setSaturation(1);
        setRotation(0);
      }
      }
      >
        <RotateCcw className="w-4 h-4"/>
      </Button>
      </div>
    </CardHeader>
    <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Label htmlFor="brightness">Brightness: {brightness.toFixed(1)}</Label>
        <Slider
          id="brightness"
          min={0}
          max={2}
          step={0.1}
          value={[brightness]}
          onValueChange={(value) => setBrightness(value[0])}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contrast">Contrast: {contrast.toFixed(1)}</Label>
        <Slider
          id="contrast"
          min={0.5}
          max={1.5}
          step={0.1}
          value={[contrast]}
          onValueChange={(value) => setContrast(value[0])}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="saturation">Saturation: {saturation.toFixed(1)}</Label>
        <Slider
          id="saturation"
          min={0}
          max={2}
          step={0.1}
          value={[saturation]}
          onValueChange={(value) => setSaturation(value[0])}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rotation">Rotation: {rotation}°</Label>
        <Slider
          id="rotation"
          min={0}
          max={360}
          step={1}
          value={[rotation]}
          onValueChange={(value) => setRotation(value[0])}
        />
      </div>
          </CardContent>
    </Card>
  );
};