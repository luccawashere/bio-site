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
        image: 'https://r2.e-z.host/f8c14cae-f13f-4fe5-a42f-8815774d026c/x9l6w2ge.webp'
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
