// Keep-alive server for web hosting platforms
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Minecraft Bot is running!');
});

app.listen(PORT, () => {
  console.log(`🌐 Keep-alive server running on port ${PORT}`);
});
