const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    max: 256,
    unique: true,
    index: true,
    required: true,
  },
  handle: {
    type: String,
    trim: true,
    lowercase: true,
    max: 256,
    unique: true,
    index: true,
    required: true,
  },
  password: {
    type: String,
    min: 8,
    max: 1024,
    required: true,
  },
  groups: [{
    type: mongoose.Types.ObjectId,
    ref: 'Group',
  }],
  contests: [{
    type: mongoose.Types.ObjectId,
    ref: 'Contest',
  }],
});

const joiUserSchema = {
  email: Joi.email().required().max(256),
  password: Joi.string().regex(/^[a-zA-Z0-9._-]$/).required().min(8).max(256),
  handle: Joi.String().required().max(256),
};

userSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'owner',
});

userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(8);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

userSchema.methods.generateAuthToken = function() {
  const user = this;
  const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);
  return token;
};

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email});
  if (!user || !bcrypt.compare(password, user.password)) {
    throw new Error('Invalid Email and/or password!');
  }
  return user;
};


userSchema.statics.validate = (user) => {
  return Joi.validate(user, joiUserSchema);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
