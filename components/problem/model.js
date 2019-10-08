const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    index: true,
    unique: true,
    trim: true,
    lowercase: true,
    max: 256,
  },
  title: {
    type: String,
    trim: true,
    required: false,
    index: false,
    unique: false,
    lowercase: false,
    max: 256,
  },
  timeLimit: { // Seconds
    type: Number,
    default: 2.0,
    min: 0.1,
    max: 60.0,
    required: false,
  },
  memoryLimit: { // MegaBytes
    type: Number,
    default: 256.0,
    min: 0.1,
    max: 1024.0,
    require: false,
  },
  statement: {
    type: String,
    required: false,
  },
  inputSection: {
    type: String,
    required: false,
  },
  outputSection: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  comments: [new mongoose.Schema({
    text: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    parentComment: {
      type: mongoose.Types.ObjectId,
      default: null,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    upVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
  })],
  owner: {

  },
  difficulty: {

  },
  inputFile: {

  },
  outputFile: {

  },
  testCases: [{

  }],
  solutionFiles: [{

  }],
  tags: [{

  }],
  accessors: [{

  }],
}, {_id: false});

const Problem = mongoose.model('problem', problemSchema);

module.exports = Problem;
