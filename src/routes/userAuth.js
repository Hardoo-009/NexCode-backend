const express = require('express');
const AuthRouter = express.Router();
const { register, login } = require('../controllers/userAuthenticate');

AuthRouter.post('/register', register);
AuthRouter.post('/login', login);
// AuthRouter.post('/logout', logout);
// AuthRouter.get('/getProfile', getProfile);

module.exports = AuthRouter;
