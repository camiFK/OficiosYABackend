const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' });

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});