const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  videoId: { type: String, required: true },
  intervals: { type: [[Number]], required: true }, 
});

module.exports = mongoose.model('Progress', progressSchema);
