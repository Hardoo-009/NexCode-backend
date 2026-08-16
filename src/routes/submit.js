const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const submitRouter = express.Router();
const { submitCode, runCode } = require('../controllers/userSubmission');

submitRouter.post('/submit/:id', userMiddleware, submitCode);
submitRouter.post('/run/:id', userMiddleware, runCode);

module.exports = submitRouter;

/*
[
  {
    stdout: '[0,1]\n',
    status_id: 3,
    time: '1.244',
    memory: 52164,
    stderr: null,
    compile_output: null,
    status: { id: 3, description: 'Accepted' }
  },
  {
    stdout: '[1,2]\n',
    status_id: 3,
    time: '1.301',
    memory: 52296,
    stderr: null,
    compile_output: null,
    status: { id: 3, description: 'Accepted' }
  },
  {
    stdout: '[0,1]\n',
    status_id: 3,
    time: '1.267',
    memory: 52584,
    stderr: null,
    compile_output: null,
    status: { id: 3, description: 'Accepted' }
  }
] */
