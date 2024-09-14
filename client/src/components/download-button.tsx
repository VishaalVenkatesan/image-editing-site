import React, { useState } from 'react';
import axios from 'axios';
import { useImage } from "../context/image-provider";
import { Button } from './ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'

export const DownloadButton: React.FC = () => {
  const { filename, brightness, contrast, saturation, rotation } = useImage();
  const [format, setFormat] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownload = async () => {
    if (filename && format) {
      setIsProcessing(true);
      try {
        // First, process the image
        const processResponse = await axios.post('http://localhost:3000/process', {
          filename,
          brightness,
          contrast,
          saturation,
          rotation,
          format
        });

        const { processedFilename } = processResponse.data;

        // Then, download the processed image
        const downloadResponse = await axios.get(`http://localhost:3000/download/${processedFilename}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `processed_image.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('Error processing or downloading image:', error);
        alert('Error processing or downloading image. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center mt-5 space-y-4">
      <Select value={format} onValueChange={setFormat}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Select Download Format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="jpg">JPEG</SelectItem>
          <SelectItem value="png">PNG</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleDownload} disabled={!filename || !format || isProcessing}>
        {isProcessing ? 'Processing...' : 'Download Processed Image'}
      </Button>
    </div>
  );
};