import express from 'express';
import type { Request, Response } from 'express';
import sharp from 'sharp';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import winston from 'winston';
import cron from 'node-cron';

const app = express();
const upload = multer({ dest:  'uploads/' });

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Configure rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
});

app.use(cors());
app.use(express.json());
app.use(limiter);

const processedDir = path.join(__dirname, 'processed');


(async () => {
  try {
    await fs.access(processedDir);
  } catch {
    await fs.mkdir(processedDir);
  }
})();

// File cleanup cron job
cron.schedule('0 0 * * *', async () => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  try {
    const files = await fs.readdir(processedDir);
    for (const file of files) {
      const filePath = path.join(processedDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > oneDay) {
        await fs.unlink(filePath);
        logger.info(`Deleted old file: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Error in cleanup job:', error);
  }
});

app.post('/upload', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  res.json({ filename: req.file.filename });
});

//did not create separate route for processing image because it was causing
//issues with the image processing because each effect was overlapping and
//was unable to recover original qualities. This is a workaround to process
//the image in the flow to update all params at one.
app.post('/process', [
  body('filename').notEmpty().withMessage('Filename is required'),
  body('brightness').isFloat({ min: 0, max: 2 }).withMessage('Brightness must be between 0 and 2'),
  body('contrast').isFloat({ min: 0, max: 2 }).withMessage('Contrast must be between 0 and 2'),
  body('saturation').isFloat({ min: 0, max: 2 }).withMessage('Saturation must be between 0 and 2'),
  body('rotation').isFloat({ min: 0, max: 360 }).withMessage('Rotation must be between 0 and 360'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { filename, brightness, contrast, saturation, rotation } = req.body;
  const inputPath = path.join(__dirname,  'uploads', filename);

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

    const [previewBuffer, pngBuffer, jpegBuffer] = await Promise.all([
      sharpInstance.clone().jpeg({ quality: 30 }).resize(800).toBuffer(),
      sharpInstance.clone().png({ quality: 100 }).toBuffer(),
      sharpInstance.jpeg({ quality: 100 }).toBuffer(),
    ]);

    const previewFilename = `${filename}_preview.jpg`;
    const pngFilename = `${filename}_processed.png`;
    const jpegFilename = `${filename}_processed.jpg`;

    await Promise.all([
      fs.writeFile(path.join(processedDir, previewFilename), previewBuffer),
      fs.writeFile(path.join(processedDir, pngFilename), pngBuffer),
      fs.writeFile(path.join(processedDir, jpegFilename), jpegBuffer),
    ]);

    res.json({ previewFilename, pngFilename, jpegFilename });
  } catch (error) {
    logger.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

app.get('/download/:filename', async (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(processedDir, filename);

  try {
    await fs.access(filePath);
    res.download(filePath);
  } catch {
    res.status(404).json({ error: 'File not found' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});