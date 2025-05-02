const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const progressRoutes = require('./routes/progressRoutes');
app.use('/api/progress', progressRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, dbName:'video-progress' })
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

app.listen(port, () => console.log(`Server running on port ${port}`));
