import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useImage } from "../context/image-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

const ImageUploadAndPreview: React.FC = () => {
  const { image, setImage, brightness, contrast, saturation, rotation, filename, setFilename } = useImage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localImage, setLocalImage] = useState<string | null>(null);

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
          }, { responseType: 'blob' });
          const url = URL.createObjectURL(response.data);
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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLocalImage(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append('image', file);
      try {
        setLoading(true);
        const response = await axios.post<{ filename: string }>('http://localhost:3000/upload', formData);
        setFilename(response.data.filename);
        setImage(URL.createObjectURL(file));
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload image. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemove = () => {
    setImage(null);
    setFilename(null);
    setLocalImage(null);
  };

  return (
    <Card className="w-full max-w-xl mx-auto mt-5 min-h-xl">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full"
            >
              <img
                src={localImage ?? image ?? ''}
                alt="Preview"
                className="object-contain w-full h-[200px] rounded-md filter blur-md"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin"></div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          ) : image ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <img src={image} alt="Preview" className="object-contain w-full h-full rounded-md" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-md aspect-video bg-muted"
            >
              <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">No image uploaded</p>
              <Button variant="outline" className="relative">
                Upload Image
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleUpload}
                  accept="image/png,image/jpeg"
                />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ImageUploadAndPreview;