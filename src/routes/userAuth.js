const express = require('express');
const AuthRouter = express.Router();

AuthRouter.post('/register', register);
AuthRouter.post('/login', login);
AuthRouter.post('/logout', logout);
AuthRouter.get('/getProfile', getProfile);
