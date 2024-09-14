import express from 'express';
import type { Request, Response } from 'express';
import sharp from 'sharp';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const processedDir = path.join(__dirname, 'processed');
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir);
}

app.post('/upload', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.json({ filename: req.file.filename });
});

app.post('/process', async (req: Request, res: Response) => {
  const { filename, brightness, contrast, saturation, rotation, format } = req.body;
  const inputPath = path.join(__dirname, 'uploads', filename);
  const outputFormat = format === 'png' ? 'png' : 'jpg';
  const outputPath = path.join(__dirname, 'processed', `${filename}_processed.${outputFormat}`);

  try {
    let sharpInstance = sharp(inputPath)
      .rotate(parseInt(rotation))
      .modulate({
        brightness: parseFloat(brightness),
        saturation: parseFloat(saturation)
      });
    
    const contrastFactor = parseFloat(contrast);
    if (contrastFactor !== 1) {
      sharpInstance = sharpInstance.linear(
        contrastFactor,
        -(128 * contrastFactor) + 128
      );
    }

    if (outputFormat === 'png') {
      await sharpInstance
        .png({ quality: 50 }) 
        .toFile(outputPath);
    } else {
      await sharpInstance
        .jpeg({ quality: 50 }) 
        .toFile(outputPath);
    }

    res.sendFile(outputPath);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
});

app.get('/download/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'processed', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});