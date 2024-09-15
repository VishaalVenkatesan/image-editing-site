import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useImage } from "../context/image-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload, Trash2, Crop, SkipForward } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import ReactCrop, { centerCrop, makeAspectCrop, Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

const ImageUploadAndPreview: React.FC = () => {
  const { image, setImage, brightness, contrast, saturation, rotation, filename, setFilename } = useImage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const processImage = async () => {
      if (filename) {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.post('http://localhost:3000/process', {
            filename,
            brightness,
            contrast,
            saturation,
            rotation
          });
          
          const previewResponse = await axios.get(`http://localhost:3000/download/${response.data.previewFilename}`, { responseType: 'blob' });
          const url = URL.createObjectURL(previewResponse.data);
          setImage(url);
        } catch (error) {
          console.error('Error processing image:', error);
          setError('Failed to process image. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    processImage();
  }, [filename, brightness, contrast, saturation, rotation, setImage]);

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const imageUrl = reader.result?.toString() || '';
      setLocalImage(imageUrl);
      setIsCropping(true);
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = makeAspectCrop(
      {
        unit: '%',
        width: 100,
        height: 100,
      },
      ASPECT_RATIO,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  };

  const handleCropComplete = (crop: PixelCrop) => {
    setCompletedCrop(crop);
  };

  const handleCropConfirm = () => {
    if (!imgRef.current || !completedCrop) return;
    processAndUploadImage(completedCrop);
  };

  const handleSkipCrop = () => {
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    processAndUploadImage({ unit: 'px', x: 0, y: 0, width, height });
  };

  const processAndUploadImage = (cropArea: PixelCrop) => {
    if (!imgRef.current) return;

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('image', blob, 'cropped-image.jpg');

      try {
        setLoading(true);
        const response = await axios.post<{ filename: string }>('http://localhost:3000/upload', formData);
        setFilename(response.data.filename);
        setImage(URL.createObjectURL(blob));
        setIsCropping(false);
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload image. Please try again.');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleRemove = () => {
    setImage(null);
    setFilename(null);
    setLocalImage(null);
    setIsCropping(false);
  };

    return (
    <Card className="w-full max-w-3xl mx-auto mt-5">
      <CardContent className="p-6">
        <div className="relative w-full" style={{ minHeight: '300px' }}>
          <AnimatePresence mode="wait">
            {isCropping ? (
              <motion.div
                key="cropping"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center w-full h-full"
              >
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={handleCropComplete}
                  aspect={ASPECT_RATIO}
                  minWidth={MIN_DIMENSION}
                >
                  <img
                    ref={imgRef}
                    src={localImage ?? ''}
                    alt="Crop"
                    onLoad={onImageLoad}
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </ReactCrop>
                <div className="mt-4 space-x-2">
                  <Button onClick={handleCropConfirm}>
                    <Crop className="w-4 h-4 mr-2" />
                    Confirm Crop
                  </Button>
                  <Button onClick={handleSkipCrop} variant="outline">
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip Crop
                  </Button>
                </div>
              </motion.div>
            ) : image || localImage ? (
              <motion.div
                key="image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full"
              >
                <img 
                  src={image ?? localImage ?? ''} 
                  alt="Preview" 
                  className="max-w-full max-h-[400px] object-contain mx-auto"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                    
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center w-full h-[300px] border-2 border-gray-300 border-dashed rounded-md bg-muted"
              >
                <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">No image uploaded</p>
                <Button variant="outline" className="relative">
                  Upload Image
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={onSelectFile}
                    accept="image/*"
                  />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadAndPreview;