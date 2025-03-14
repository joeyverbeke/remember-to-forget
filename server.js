const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'images'));
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueSuffix = crypto.randomBytes(8).toString('hex');
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// where memories live
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Handle image uploads
app.post('/api/upload', upload.array('images'), (req, res) => {
    try {
        const uploadedFiles = req.files.map(file => ({
            id: path.parse(file.filename).name,
            url: `/images/${file.filename}`
        }));
        res.json(uploadedFiles);
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

// gather the fragments
app.get('/api/images', (req, res) => {
    const imageDir = path.join(__dirname, 'public', 'images');
    const files = fs.readdirSync(imageDir)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file, index) => ({
            id: path.parse(file).name,
            url: `/images/${file}`
        }));
    
    files.sort(() => Math.random() - 0.5);
    
    res.json(files);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 

//comment for branch