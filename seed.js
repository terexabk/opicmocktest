const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb+srv://dbOpicKorea:270991@cluster0.tujpjti.mongodb.net/opic_korean?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function seed() {
  try {
    // Get all questions from the database
    const questions = await Question.find();
    
    // Update the total field for each question with the actual count
    const totalQuestions = questions.length;
    
    // Update all questions with the correct total
    await Question.updateMany({}, { total: totalQuestions });
    
    console.log(`Updated total questions count to ${totalQuestions}`);
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating questions:', error);
    mongoose.disconnect();
  }
}

seed();