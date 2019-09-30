const jwt = require('jsonwebtoken');
const User = require('./model');
const status = require('http-status');

module.exports = async function(req, res, next) {
  if (!req.header('Authorization')) {
    return res.status(status.BAD_REQUEST).send('Authorization Token Required!');
  }
  const token = req.header('Authorization').replace('Bearer ', '');
  jwt.verify(token, process.env.JWT_SECRET, async function(err, {_id}) {
    if (err) {
      return res.status(status.UNAUTHORIZED).json(err);
    }
    try {
      const user = await User.findById(_id);
      if (!user) {
        res.status(status.UNAUTHORIZED).send('Invalid Authorization Token!');
        return;
      }
      req.user = user;
      next();
    } catch (e) {
      return res.status(status.INTERNAL_SERVER_ERROR).json(e);
    }
  });
};
