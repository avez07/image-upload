const express = require('express');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const app = express();

// Load environment variables

// Connect to MongoDB
mongoose.connect('/imageUplaod', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema and model for storing image names
const imageSchema = new mongoose.Schema({
    name: String,
    multiName : Array,
});
const Image = mongoose.model('Image', imageSchema);

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve static files
app.use(express.static(path.join(__dirname, '/public')));
app.use('/img', express.static('./public/uploads'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload_single_image', upload.single('singleImage'), async (req, res) => {
    try {
        const imageName = req.file.filename;
        const newImage = new Image({ name: imageName });
        await newImage.save();
        res.send('File uploaded and image name saved to database');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error uploading file');
    }
});

app.post('/upload_multiple_image', upload.array('multipleImage', 10), async (req, res) => {
    try {
        const imageNames = req.files.map(file => file.filename);
        const newImage = new Image({ multiName: imageNames });
        await newImage.save();
        res.send('Files uploaded and image names saved to database');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error uploading files');
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});
