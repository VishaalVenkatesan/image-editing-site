import React, { useState } from 'react';
import axios from 'axios';
import { useImage } from "../context/image-provider";
import { Button } from './ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'

export const DownloadButton: React.FC = () => {
  const { filename } = useImage();
  const [format, setFormat] = useState('jpg');

  const handleDownload = async () => {
    if (filename) {
      try {
        const response = await axios.get(`http://localhost:3000/download/${filename}_processed.${format}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `processed_image.${format}`);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center mt-5 space-y-4">
      <Select value={format} onValueChange={setFormat}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="jpg">JPEG</SelectItem>
          <SelectItem value="png">PNG</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleDownload} disabled={!filename}>Download Processed Image</Button>
    </div>
  );
};