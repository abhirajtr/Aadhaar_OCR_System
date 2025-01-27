// backend/server.js

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { configDotenv } from 'dotenv';
import { corsOptions } from './utils/corsConfig.js';

configDotenv();

const app = express();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

app.use(cors(corsOptions));
app.use(express.json());

// Image upload and OCR endpoint
app.post('/api/ocr', upload.fields([{ name: "front" }, { name: "back" }]), async (req, res) => {
    try {
        const frontImage = req.files?.front?.[0];
        const backImage = req.files?.back?.[0];

        if (!frontImage || !backImage) {
            return res.status(400).json({ message: "Both front and back images are required." });
        }


        // Process images using sharp
        const processedFront = await sharp(frontImage.buffer)
            .grayscale()
            .sharpen()
            .toBuffer();

        const processedBack = await sharp(backImage.buffer)
            .grayscale()
            .sharpen()
            .toBuffer();

        // Perform OCR
        const [frontResult, backResult] = await Promise.all([
            Tesseract.recognize(processedFront, 'eng'),
            Tesseract.recognize(processedBack, 'eng')
        ]);

        // Extract information
        const aadhaarInfo = {
            number: extractAadhaarNumber(frontResult.data.text),
            name: extractName(frontResult.data.text),
            dob: extractDOB(frontResult.data.text),
            address: extractAddress(backResult.data.text)
        };
        console.log(aadhaarInfo);

        res.status(200).json(aadhaarInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing images' });
    }
});

// Helper functions for text extraction
function extractAadhaarNumber(text) {
    const match = text.match(/\d{4}\s\d{4}\s\d{4}/);
    return match ? match[0] : '';
}

function extractName(text) {
    // Look for text after "To" or on a new line
    const nameMatch = text.match(/(?:To\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    return nameMatch ? nameMatch[1] : '';
}

function extractDOB(text) {
    const match = text.match(/\d{2}\/\d{2}\/\d{4}/);
    return match ? match[0] : '';
}

function extractAddress(text) {
    const lines = text.split('\n');
    const addressLines = lines.filter(line =>
        line.match(/\b(HOUSE|STREET|ROAD|DISTRICT|STATE|PIN|[0-9]{6})\b/i)
    );
    return addressLines.join(' ').trim();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));