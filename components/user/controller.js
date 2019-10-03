const User = require('./model');
const status = require('http-status');
const validator = require('validator');
module.exports = {
  create: async function(req, res) {
    const {error} = User.validate(req.body);
    if (error) {
      return res.status(status.BAD_REQUEST).json(error);
    }
    const user = new User(req.body);
    try {
      await user.save();
      const token = user.generateAuthToken();
      return res.status(status.CREATED).header('x-token', token).json(user);
    } catch (e) {
      if (e.code == 11000) {
        return res.status(status.BAD_REQUEST).json(e);
      }
      return res.status(status.INTERNAL_SERVER_ERROR).json(e);
    }
  },
  login: async function(req, res) {
    const {credential, password} = req.body;
    try {
      let user;
      if (validator.isEmail(credential)) {
        user = await User.findByEmail(credential, password);
      } else {
        user = await User.findByHandle(credential, password);
      }
      return res.status(status.OK).json(user);
    } catch (e) {
      return res.status(status.BAD_REQUEST).json(e);
    }
  },
  get: function(req, res) {
    return res.status(status.OK).json(req.user);
  },
  getUser: async function(req, res) {
    const key = req.params.userIdOrHandle;
    try {
      let user;
      if (validator.isMongoId(key)) {
        user = await User.findById(key);
      } else {
        user = await User.findOne({handle: key});
      }
      if (!user) {
        return res.status(status.NOT_FOUND).send('User Not Found');
      }
      return res.status(status.OK).json(user.getPublicData());
    } catch (e) {
      return res.status(status.INTERNAL_SERVER_ERROR).json(e);
    }
  },
};
