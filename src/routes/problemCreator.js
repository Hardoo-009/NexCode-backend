const { createProblem, updateProblem } = require('../controllers/userProblems');

const express = require('express');
const problemRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
// these apis are for the admin
problemRouter.post('/create', adminMiddleware, createProblem);
problemRouter.put('/update/:id', adminMiddleware, updateProblem);
problemRouter.delete('/delete/:id', adminMiddleware, deleteProblem);

// these can be accessed by the user as well as the admin
problemRouter.get('/problemById/:id', userMiddleware, getProblemById);
problemRouter.get('/getallproblem', userMiddleware, getAllProblem);
problemRouter.get('/problemsolvedbyuser', userMiddleware, getAllSolvedProblem);
problemRouter.get('/submittedproblem/:pid', userMiddleware, submittedproblem);

module.exports = problemRouter;
