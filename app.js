const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// Serve favicon.ico from the project root
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

// Middleware to parse JSON bodies
app.use(express.json());

// Route for the bio page
app.get('/', (req, res) => {
    res.render('index', {
        name: 'luca',
        description: 'test',
        image: 'https://media.discordapp.net/attachments/1132696452213260318/1267410628520312914/47972624dac010076140093160da661f.webp?ex=66a8afa1&is=66a75e21&hm=6b0aed9179611c02049f4da0363541defbc4fe48117d4069b69254195a8a2d90&=&format=webp&width=280&height=280'
    });
});

// View counter endpoint
app.post('/view-counter', (req, res) => {
    const filePath = path.join(__dirname, 'views.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read view count' });
        }
        let viewData = JSON.parse(data);
        viewData.count += 1;
        fs.writeFile(filePath, JSON.stringify(viewData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update view count' });
            }
            res.json({ count: viewData.count });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
