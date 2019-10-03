const express = require('express');
require('./utils/mongoose');
const userRouter = require('./components/user/router');
const problemRouter = require('./components/user/router');

const app = express();

app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/problems', problemRouter);

module.exports = app;
