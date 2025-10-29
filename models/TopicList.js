const mongoose = require('mongoose');

const topicListSchema = new mongoose.Schema({
  ques_nbr: Number,
  get_date: Number,
  topic: String
});

module.exports = mongoose.model('TopicList', topicListSchema, 'topic_list'); 