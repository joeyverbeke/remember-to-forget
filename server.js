const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// where memories live
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// gather the fragments
app.get('/api/images', (req, res) => {
    const imageDir = path.join(__dirname, 'public', 'images');
    const files = fs.readdirSync(imageDir)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file, index) => ({
            id: index + 1,
            url: `/images/${file}`
        }));
    
    files.sort(() => Math.random() - 0.5);
    
    res.json(files);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 