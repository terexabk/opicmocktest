const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const TopicList = require('../models/TopicList');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to clean up old audio files
function cleanupOldAudioFiles() {
  const audioDir = 'public/result_audio';
  if (fs.existsSync(audioDir)) {
    fs.readdir(audioDir, (err, files) => {
      if (err) {
        console.error('Error reading audio directory:', err);
        return;
      }
      
      files.forEach(file => {
        if (file.endsWith('.mp3')) {
          fs.unlink(path.join(audioDir, file), err => {
            if (err) {
              console.error(`Error deleting file ${file}:`, err);
            } else {
              console.log(`Deleted old audio file: ${file}`);
            }
          });
        }
      });
    });
  }
}

// Configure multer for audio storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public/result_audio';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `answer_${timestamp}.mp3`);
  }
});

const upload = multer({ storage: storage });

// Welcome page
router.get('/', (req, res) => {
  res.render('welcome');
});

// Handle exam start
router.post('/start', async (req, res) => {
  try {
    // Clean up old audio files before starting new exam
    cleanupOldAudioFiles();

    // Get the topic for question 1 from topic_list
    const topicInfo = await TopicList.findOne({ ques_nbr: 1 });
    if (!topicInfo) {
      return res.send('Topic information not found');
    }

    // Update get_date for topic
    topicInfo.get_date = Date.now();
    await topicInfo.save();

    // Get questions for the specific topic
    const questions = await Question.find({ topic: topicInfo.topic }).sort({ _id: 1 });
    if (questions.length === 0) {
      return res.send('No questions available for this topic');
    }

    // Update get_date for the first question
    questions[0].get_date = Date.now();
    await questions[0].save();

    // Store the topic and first question index in session
    req.session = req.session || {};
    req.session.currentTopic = topicInfo.topic;
    req.session.currentIndex = 0;
    req.session.totalQuestions = 15; // Set total questions to 15

    res.redirect('/question/1');
  } catch (error) {
    console.error('Error starting exam:', error);
    res.send('Error starting exam');
  }
});

// Show question by index
router.get('/question/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10); // 1-based index
    
    if (!req.session.currentTopic) {
      return res.redirect('/');
    }

    let question;
    let total = req.session.totalQuestions || 15;

    if (index === 1) {
      // First question - use current topic
      const questions = await Question.find({ topic: req.session.currentTopic }).sort({ _id: 1 });
      if (questions.length === 0) {
        return res.send('Question not found');
      }
      question = questions[0];
    } else if (index >= 2 && index <= 4) {
      // Questions 2-4 - get topic from topic_list
      let selectedTopic;
      
      if (!req.session.selectedTopic) {
        // If we don't have a selected topic yet, get one from topic_list
        const topicList = await TopicList.find({ ques_nbr: 2 }).sort({ get_date: 1 });
        if (topicList.length === 0) {
          return res.send('Topic information not found');
        }
        selectedTopic = topicList[0];
        // Store the selected topic in session
        req.session.selectedTopic = selectedTopic.topic;
      } else {
        // Use the stored topic
        selectedTopic = await TopicList.findOne({ 
          ques_nbr: 2,
          topic: req.session.selectedTopic 
        });
        if (!selectedTopic) {
          return res.send('Topic information not found');
        }
      }

      let topicUsed = false;

      if (index === 2) {
        // Question 2 - get type="I" and type_nbr=0
        question = await Question.findOne({
          topic: selectedTopic.topic,
          type: "I",
          type_nbr: 0
        }).sort({ get_date: 1 });

        if (!question) {
          // Try next topic
          const topicList = await TopicList.find({ ques_nbr: 2 }).sort({ get_date: 1 });
          const currentIndex = topicList.findIndex(t => t.topic === selectedTopic.topic);
          if (currentIndex < topicList.length - 1) {
            selectedTopic = topicList[currentIndex + 1];
            req.session.selectedTopic = selectedTopic.topic;
            question = await Question.findOne({
              topic: selectedTopic.topic,
              type: "I",
              type_nbr: 0
            }).sort({ get_date: 1 });
          }
        }
        
        if (!question) {
          return res.send('Question not found');
        }
        topicUsed = true;
      } else if (index === 3) {
        // Question 3 - get type="I" and type_nbr=0
        question = await Question.findOne({
          topic: selectedTopic.topic,
          type: "I",
          type_nbr: 0
        }).sort({ get_date: 1 });

        if (!question) {
          // Try next topic
          const topicList = await TopicList.find({ ques_nbr: 2 }).sort({ get_date: 1 });
          const currentIndex = topicList.findIndex(t => t.topic === selectedTopic.topic);
          if (currentIndex < topicList.length - 1) {
            selectedTopic = topicList[currentIndex + 1];
            req.session.selectedTopic = selectedTopic.topic;
            question = await Question.findOne({
              topic: selectedTopic.topic,
              type: "A",
              type_nbr: 0
            }).sort({ get_date: 1 });
          }
        }

        if (!question) {
          return res.send('Question not found');
        }
        // Store the question ID used in question 3
        req.session.question3Id = question._id;
        topicUsed = true;
      } else if (index === 4) {
        // Question 4 - get type="A" and type_nbr=0, but skip the one used in question 3
        let questions = await Question.find({
          topic: selectedTopic.topic,
          type: "A",
          type_nbr: 0,
          _id: { $ne: req.session.question3Id } // Exclude the question used in question 3
        }).sort({ get_date: 1 });

        if (questions.length === 0) {
          // Try next topic
          const topicList = await TopicList.find({ ques_nbr: 2 }).sort({ get_date: 1 });
          const currentIndex = topicList.findIndex(t => t.topic === selectedTopic.topic);
          if (currentIndex < topicList.length - 1) {
            selectedTopic = topicList[currentIndex + 1];
            req.session.selectedTopic = selectedTopic.topic;
            questions = await Question.find({
              topic: selectedTopic.topic,
              type: "A",
              type_nbr: 0
            }).sort({ get_date: 1 });
          }
        }

        if (questions.length === 0) {
          return res.send('Not enough questions available for any topic');
        }

        // Get the first available question that's different from question 3
        question = questions[0];
        topicUsed = true;
      }

      // Only update get_date if we actually used a question from this topic
      if (topicUsed) {
        selectedTopic.get_date = Date.now();
        await selectedTopic.save();
      }
    } else if (index >= 5 && index <= 7) {
      // Questions 5-7 - get topic from topic_list with ques_nbr=5
      let selectedTopic;
      
      if (!req.session.selectedTopic5) {
        // If we don't have a selected topic yet, get one from topic_list
        const topicList = await TopicList.find({ ques_nbr: 2 }).sort({ get_date: 1 });
        if (topicList.length === 0) {
          return res.send('Topic information not found');
        }
        selectedTopic = topicList[0];
        // Store the selected topic in session
        req.session.selectedTopic5 = selectedTopic.topic;
      } else {
        // Use the stored topic
        selectedTopic = await TopicList.findOne({ 
          ques_nbr: 2,
          topic: req.session.selectedTopic5 
        });
        if (!selectedTopic) {
          return res.send('Topic information not found');
        }
      }

      let topicUsed = false;

      if (index === 5) {
        // Question 5 - get type="I" and type_nbr=0
        question = await Question.findOne({
          topic: selectedTopic.topic,
          type: "I",
          type_nbr: 0
        }).sort({ get_date: 1 });

        if (!question) {
          // Try next topic
          const topicList = await TopicList.find({ ques_nbr: 2 }).sort({ get_date: 1 });
          const currentIndex = topicList.findIndex(t => t.topic === selectedTopic.topic);
          if (currentIndex < topicList.length - 1) {
            selectedTopic = topicList[currentIndex + 1];
            req.session.selectedTopic5 = selectedTopic.topic;
            question = await Question.findOne({
              topic: selectedTopic.topic,
              type: "I",
              type_nbr: 0
            }).sort({ get_date: 1 });
          }
        }
        
        if (!question) {
          return res.send('Question not found');
        }
        topicUsed = true;
      } else if (index === 6) {
        // Question 6 - get type="A" and type_nbr=0
        question = await Question.findOne({
          topic: selectedTopic.topic,
          type: "A",
          type_nbr: 0
        }).sort({ get_date: 1 });

        if (!question) {
          // Try next topic
          const topicList = await TopicList.find({ ques_nbr: 2 }).sort({ get_date: 1 });
          const currentIndex = topicList.findIndex(t => t.topic === selectedTopic.topic);
          if (currentIndex < topicList.length - 1) {
            selectedTopic = topicList[currentIndex + 1];
            req.session.selectedTopic5 = selectedTopic.topic;
            question = await Question.findOne({
              topic: selectedTopic.topic,
              type: "A",
              type_nbr: 0
            }).sort({ get_date: 1 });
          }
        }

        if (!question) {
          return res.send('Question not found');
        }
        // Store the question ID used in question 6
        req.session.question6Id = question._id;
        topicUsed = true;
      } else if (index === 7) {
        // Question 7 - get type="A" and type_nbr=0, but skip the one used in question 6
        let questions = await Question.find({
          topic: selectedTopic.topic,
          type: "A",
          type_nbr: 0,
          _id: { $ne: req.session.question6Id } // Exclude the question used in question 6
        }).sort({ get_date: 1 });

        if (questions.length === 0) {
          // Try next topic
          const topicList = await TopicList.find({ ques_nbr: 2 }).sort({ get_date: 1 });
          const currentIndex = topicList.findIndex(t => t.topic === selectedTopic.topic);
          if (currentIndex < topicList.length - 1) {
            selectedTopic = topicList[currentIndex + 1];
            req.session.selectedTopic5 = selectedTopic.topic;
            questions = await Question.find({
              topic: selectedTopic.topic,
              type: "A",
              type_nbr: 0
            }).sort({ get_date: 1 });
          }
        }

        if (questions.length === 0) {
          return res.send('Not enough questions available for any topic');
        }

        // Get the first available question that's different from question 6
        question = questions[0];
        topicUsed = true;
      }

      // Only update get_date if we actually used a question from this topic
      if (topicUsed) {
        selectedTopic.get_date = Date.now();
        await selectedTopic.save();
      }
    } else if (index >= 8 && index <= 10) {
      // Questions 8-10 - get topic from topic_list with ques_nbr=8
      let selectedTopic;
      
      if (!req.session.selectedTopic8) {
        // If we don't have a selected topic yet, get one from topic_list
        const topicList = await TopicList.find({ ques_nbr: 8 }).sort({ get_date: 1 });
        if (topicList.length === 0) {
          return res.send('Topic information not found');
        }
        selectedTopic = topicList[0];
        // Store the selected topic in session
        req.session.selectedTopic8 = selectedTopic.topic;
      } else {
        // Use the stored topic
        selectedTopic = await TopicList.findOne({ 
          ques_nbr: 8,
          topic: req.session.selectedTopic8 
        });
        if (!selectedTopic) {
          return res.send('Topic information not found');
        }
      }

      if (index === 8) {
        // Question 8 - get type="I" and type_nbr=0
        question = await Question.findOne({
          topic: selectedTopic.topic,
          type: "I",
          type_nbr: 0
        }).sort({ get_date: 1 });

        if (!question) {
          // Try next topic
          const topicList = await TopicList.find({ ques_nbr: 8 }).sort({ get_date: 1 });
          const currentIndex = topicList.findIndex(t => t.topic === selectedTopic.topic);
          if (currentIndex < topicList.length - 1) {
            selectedTopic = topicList[currentIndex + 1];
            req.session.selectedTopic8 = selectedTopic.topic;
            question = await Question.findOne({
              topic: selectedTopic.topic,
              type: "I",
              type_nbr: 0
            }).sort({ get_date: 1 });
          }
        }
        
        if (!question) {
          return res.send('Question not found');
        }
        topicUsed = true;
      } else if (index === 9) {
        // Question 9 - get type="A" and type_nbr=0
        question = await Question.findOne({
          topic: selectedTopic.topic,
          type: "A",
          type_nbr: 0
        }).sort({ get_date: 1 });

        if (!question) {
          // Try next topic
          const topicList = await TopicList.find({ ques_nbr: 8 }).sort({ get_date: 1 });
          const currentIndex = topicList.findIndex(t => t.topic === selectedTopic.topic);
          if (currentIndex < topicList.length - 1) {
            selectedTopic = topicList[currentIndex + 1];
            req.session.selectedTopic8 = selectedTopic.topic;
            question = await Question.findOne({
              topic: selectedTopic.topic,
              type: "A",
              type_nbr: 0
            }).sort({ get_date: 1 });
          }
        }

        if (!question) {
          return res.send('Question not found');
        }
        // Store the question ID used in question 9
        req.session.question9Id = question._id;
        topicUsed = true;
      } else if (index === 10) {
        // Question 10 - get type="A" and type_nbr=0, but skip the one used in question 9
        let questions = await Question.find({
          topic: selectedTopic.topic,
          type: "A",
          type_nbr: 0,
          _id: { $ne: req.session.question9Id } // Exclude the question used in question 9
        }).sort({ get_date: 1 });

        if (questions.length === 0) {
          // Try next topic
          const topicList = await TopicList.find({ ques_nbr: 8 }).sort({ get_date: 1 });
          const currentIndex = topicList.findIndex(t => t.topic === selectedTopic.topic);
          if (currentIndex < topicList.length - 1) {
            selectedTopic = topicList[currentIndex + 1];
            req.session.selectedTopic8 = selectedTopic.topic;
            questions = await Question.find({
              topic: selectedTopic.topic,
              type: "A",
              type_nbr: 0
            }).sort({ get_date: 1 });
          }
        }

        if (questions.length === 0) {
          return res.send('Not enough questions available for any topic');
        }

        // Get the first available question that's different from question 9
        question = questions[0];
        topicUsed = true;
      }

      // Only update get_date if we actually used a question from this topic
      if (topicUsed) {
        selectedTopic.get_date = Date.now();
        await selectedTopic.save();
      }
    } else if (index === 11) {
      // Question 11 - get type_nbr=11 and sort by get_date
      question = await Question.findOne({
        type_nbr: 11
      }).sort({ get_date: 1 });

      if (!question) {
        return res.send('Question not found');
      }
    } else if (index === 12) {
      // Question 12 - get type_nbr=12 and sort by get_date
      question = await Question.findOne({
        type_nbr: 12
      }).sort({ get_date: 1 });

      if (!question) {
        return res.send('Question not found');
      }
    } else if (index === 13) {
      // Question 13 - get type_nbr=13 and sort by get_date
      question = await Question.findOne({
        type_nbr: 13
      }).sort({ get_date: 1 });

      if (!question) {
        return res.send('Question not found');
      }
    } else if (index === 14) {
      // Question 14 - get type_nbr=14 and sort by get_date
      question = await Question.findOne({
        type_nbr: 14
      }).sort({ get_date: 1 });

      if (!question) {
        return res.send('Question not found');
      }
    } else if (index === 15) {
      // Question 15 - get type_nbr=15 and sort by get_date
      question = await Question.findOne({
        type_nbr: 15
      }).sort({ get_date: 1 });

      if (!question) {
        return res.send('Question not found');
      }
    } else {
      return res.send('Invalid question number');
    }
    
    // Update get_date for the selected question
    question.get_date = Date.now();
    await question.save();
    
    console.log("Question:", question.questionContent);
    console.log("Answer:", question.answerContent);
    console.log("audio:", question.audio);
    res.render('question', { 
      question: question,
      index: index - 1, // Convert to 0-based index for display
      total: total
    });
  } catch (error) {
    console.error('Error loading question:', error);
    res.send('Error loading question');
  }
});

// Handle next question
router.post('/next', async (req, res) => {
  try {
    const currentIndex = parseInt(req.body.currentIndex, 10);
    const nextIndex = currentIndex + 2; // Convert to 1-based index

    // If we're going back to question 1, clear the selected topic
    if (nextIndex === 1) {
      req.session.selectedTopic = null;
    }

    res.redirect(`/question/${nextIndex}`);
  } catch (error) {
    console.error('Error handling next question:', error);
    res.send('Error moving to next question');
  }
});

// Handle finish
router.post('/finish', (req, res) => {
  const audioDir = 'public/result_audio';
  let audioFiles = [];

  if (fs.existsSync(audioDir)) {
    audioFiles = fs.readdirSync(audioDir)
      .filter(file => file.endsWith('.mp3'))
      .sort((a, b) => {
        // Sort by timestamp in filename
        const timeA = parseInt(a.split('_')[1].split('.')[0]);
        const timeB = parseInt(b.split('_')[1].split('.')[0]);
        return timeA - timeB;
      });
  }

  res.render('finish', { audioFiles });
});

// Handle audio upload
router.post('/save-audio', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file received' });
    }
    res.json({ success: true, filename: req.file.filename });
  } catch (error) {
    console.error('Error saving audio:', error);
    res.status(500).json({ error: 'Error saving audio file' });
  }
});

// Handle audio evaluation
router.post('/evaluate-audio', async (req, res) => {
  try {
    const { audioFile } = req.body;
    const audioPath = path.join('public/result_audio', audioFile);

    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    // 1. Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
    });

    // 2. Evaluate the transcription using GPT
    const evaluation = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an English language assessment expert. Evaluate the following speech for: 1) Pronunciation 2) Grammar 3) Fluency 4) Content relevance. Provide specific feedback and suggestions for improvement. Rate each aspect from 1-5 (5 being the best)."
        },
        {
          role: "user",
          content: transcription.text
        }
      ]
    });

    res.json({
      transcription: transcription.text,
      evaluation: evaluation.choices[0].message.content
    });

  } catch (error) {
    console.error('Error evaluating audio:', error);
    res.status(500).json({ error: 'Error evaluating audio' });
  }
});

// Test OpenAI API key configuration
router.get('/test-openai', (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({
      status: 'error',
      message: 'OPENAI_API_KEY is not set in environment variables'
    });
  }

  // Check if API key is in the correct format (starts with 'sk-')
  if (!apiKey.startsWith('sk-')) {
    return res.status(500).json({
      status: 'error',
      message: 'OPENAI_API_KEY appears to be invalid (should start with sk-)'
    });
  }

  res.json({
    status: 'success',
    message: 'OPENAI_API_KEY is properly configured',
    keyPrefix: apiKey.substring(0, 7) + '...' // Show only first 7 characters for security
  });
});

module.exports = router;