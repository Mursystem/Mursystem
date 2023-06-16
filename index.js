const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

// Serve the static files from the 'public' directory
app.use(express.static('public'));

// Serve the 'demo.html' file from the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
