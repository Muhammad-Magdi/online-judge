const express = require('express');
const userController = require('./controller');
const userAuth = require('./auth');

const router = new express.Router();

/**
 * Sign Up new User
 * POST /api/users
 */
router.post('/', userController.create);

/**
 * Sign In user
 * GET /api/users/login
 */
router.get('/login', userController.login);

/**
 * Read My Profile
 * GET /api/users/me
 */
// router.get('/me', userAuth, userController.get);

/**
 * Read User Public data
 * GET /api/users/:userId
 */
// router.get('/:userId', userController.getUser);

/**
 * Update My Profile
 * PUT /api/users/me
 */
// router.put('/me', userAuth, userController.update);

/**
 * Delete Account
 * DELETE /api/users/me
 */
// router.delete('/me', userAuth, userController.delete);

module.exports = router;
