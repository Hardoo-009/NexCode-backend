const express = require('express');
const AuthRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { register, login, logout } = require('../controllers/userAuthenticate');

AuthRouter.post('/register', register);
AuthRouter.post('/login', login);
AuthRouter.post('/logout', userMiddleware, logout);
// AuthRouter.get('/getProfile', getProfile);

module.exports = AuthRouter;
