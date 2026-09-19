const Problem = require('../models/problems');
const Submission = require('../models/submission');
const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require('../utils/problemUtility');

const submitCode = async (req, res) => {
  try {
    // user is sending us the id of the problem which he is submitting
    const userId = req.user._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !problemId || !code || !language) {
      return res.status(400).send('Some field missing');
    }

    // getting the problem because it is having the hiddentestcases which we will run and see
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).send('Problem not found');
    }
    const languageId = getLanguageById(language);

    if (!languageId) {
      return res.status(400).send('Unsupported language');
    }

    // before running the test cases we are storing the data which we have now , bcz if there is some problem we won't get the sent solution again
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      testCasesTotal: problem.hiddenTestCases.length,
      status: 'pending',
    });

    // now check the hiddentest cases
    const submissions = problem.hiddenTestCases.map((testCase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testCase.input,
      expected_output: testCase.output,
    }));

    const submitResult = await submitBatch(submissions);
    const resultTokens = submitResult.map((result) => result.token);
    const testResults = await submitToken(resultTokens);

    // now inspecting the testResults we will decide about the submission
    let testCasesPassed = 0;
    let runtime = 0; // sum of the runtime of the all the tokens
    let memory = 0; // max of the memory required
    let status = 'accepted';
    let errorMessage = null;

    console.log(testResults);
    for (const test of testResults) {
      console.log(test.status_id);
      if (test.status_id === 3) {
        testCasesPassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, Number(test.memory || 0));
      } else {
        if (test.status_id === 4) {
          status = 'error';
          errorMessage = test.stderr;
        } else {
          status = 'wrong';
          errorMessage =
            test.stderr || test.compile_output || test.stdout || 'Wrong Answer';
        }
        break; // if the verdict is not accepted then just break out , no need to check further
      }
    }

    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    // we have to put in our user model the problem he just solved , if it is not present already
    // req.user = await User.findById(id) --> done before in middleware
    if (!req.user.problemSolved.includes(problemId)) {
      req.user.problemSolved.push(problemId);
      await req.user.save();
    }

    return res.status(201).json({
      accepted: status === 'accepted',
      passedTestCases: testCasesPassed,
      totalTestCases: problem.hiddenTestCases.length,
      runtime,
      memory,
      error: status !== 'accepted' ? errorMessage : null,
    });
  } catch (error) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
};

/*
  the testcases looks like this :
    stdout: '[0,1]\n',
    status_id: 3,
    time: '1.267',
    memory: 52584,
    stderr: null,
    compile_output: null,
    status: { id: 3, description: 'Accepted' }
*/

const runCode = async (req, res) => {
  try {
    // in run code we have to check the visible test cases and don't have to save anything on the db
    // just have to send the verdict that the test cases passes or not
    const userId = req.user._id;
    const problemId = req.params.id;

    const { code, language } = req.body;

    if (!userId || !problemId || !code || !language) {
      return res.status(400).send('Some field missing');
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).send('Problem not found');
    }

    const languageId = getLanguageById(language);

    if (!languageId) {
      return res.status(400).send('Unsupported language');
    }
    const submissions = problem.visibleTestCases.map((testCase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testCase.input,
      expected_output: testCase.output,
    }));

    const submitResult = await submitBatch(submissions);
    const resultTokens = submitResult.map((result) => result.token);
    const testResults = await submitToken(resultTokens);

    let allPassed = true;
    let runtime = 0;
    let memory = 0;

    const mappedTestCases = testResults.map((test, index) => {
      const passed = test.status.id === 3;
      if (!passed) allPassed = false;
      runtime += parseFloat(test.time || 0);
      memory = Math.max(memory, Number(test.memory || 0));

      return {
        stdin: problem.visibleTestCases[index].input,
        expected_output: problem.visibleTestCases[index].output,
        stdout: test.stdout, // what result came in the test
        status_id: test.status_id,
      };
    });

    return res.status(201).json({
      success: allPassed,
      runtime, // total runtime , in the map fn above they have been added
      memory, // again the total max amount of memory
      testCases: mappedTestCases, // individual values we are sending
    });
  } catch (error) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = { submitCode, runCode };
