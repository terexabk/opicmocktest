const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: String,
  image: String, // path to image file
  audio: String, // path to audio file
  total: { type: Number, default: 2 }, // default total questions
  questionContent: String, // Korean question text
  answerContent: String, // Korean answer text
  topic: String, // topic of the question
  type: { type: String, enum: ['I', 'A'] }, // type of question: I for 1 minute, A for 2 minutes
  type_nbr: Number, // type number for the question
  nbr: Number, // number of the question
  get_date: Number, // get date for sorting
  audioAns: String // path to answer audio file
});

module.exports = mongoose.model('Question', questionSchema);