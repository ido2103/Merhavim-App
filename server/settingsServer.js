const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const SETTINGS_FILE_PATH = path.join(__dirname, '../src/settings.json');

app.post('/update-settings', (req, res) => {
  try {
    const { newId } = req.body;
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, 'utf8'));
    
    if (!settings.allowedNumbers.includes(Number(newId))) {
      settings.allowedNumbers.push(Number(newId));
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2));
      console.log(`Added ID ${newId} to settings.json`);
    }
    
    res.json({ success: true, message: `Updated settings with ID ${newId}` });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Settings server running on port ${PORT}`);
}); 