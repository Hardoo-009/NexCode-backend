const express = require('express');
const AuthRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
  checkAuth,
} = require('../controllers/userAuthenticate');

// normal registration -> role = user
AuthRouter.post('/register', register);
AuthRouter.post('/login', login);
AuthRouter.post('/logout', userMiddleware, logout);
// admin regististation can be done only by an admin itself , that is why another endpoint to make the admin register
AuthRouter.post('/admin/register', adminMiddleware, adminRegister);
AuthRouter.delete('/delete', userMiddleware, deleteProfile);
AuthRouter.get('/check', userMiddleware, checkAuth);
// AuthRouter.get('/getProfile', getProfile);

module.exports = AuthRouter;
