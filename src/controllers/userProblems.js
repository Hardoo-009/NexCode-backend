const Problem = require('../models/problems');
const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require('../utils/problemUtility');

const createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      starterCode,
      referenceSolution,
    } = req.body;

    // before saving the question we will have to verify that if the solution is even valid for that set of inputs and outputs , so we will be sending the code, lang , input and output to judge0 to verify it
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      if (!languageId) {
        return res.status(400).json({
          message: `Unsupported language: ${language}`,
        });
      }

      const submissions = visibleTestCases.map((testCase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      const submitResult = await submitBatch(submissions);
      // this submitResult will be a array of token...
      // it is a 2 way process to get the final verdict of the solution
      // fisrt we make a batch submission to judge0(submissions) -> it returns us a array of token
      // now again we have to make a get request with the token to get the final verdict

      /*
      submitResult is like :
      [
          {
            "token": "db54881d-bcf5-4c7b-a2e3-d33fe7e25de7"
          },
          {
          "token": "ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1"
          },
          {
          "token": "1b35ec3b-5776-48ef-b646-d5522bdeb2cc"
          }
      ]
      */
      const resultToken = submitResult.map((result) => result.token);

      const testResult = await submitToken(resultToken);
      // now the testresult can be 3 or more than 3 , if it is 3 then it is correct else , send wrong status
      for (const test of testResult) {
        if (test.status_id !== 3) {
          return res.status(400).json({
            message: `${language} reference solution failed on visible test cases.`,
            error: test,
          });
        }
      }
    }

    // now if all the language and complete code are checked , now add the problem in the database
    const problem = await Problem.create({
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      starterCode,
      referenceSolution,
      problemCreator: req.user._id,
    });
    res.status(201).json({
      message: 'Problem created successfully.',
      problem,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create problem.',
      error: err.message,
    });
  }
};

const updateProblem = async (req, res) => {
  // we will take the id , and update the whole document and also test if the preference solution and the test cases run ok
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send('Missing Id...');
    }

    const {
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      starterCode,
      referenceSolution,
    } = req.body;

    // the problem has to be present in the database
    const DSAProblem = await Problem.findById(id);
    if (!DSAProblem) {
      return res.status(404).send('Problem not found');
    }

    if (
      !Array.isArray(referenceSolution) ||
      !Array.isArray(visibleTestCases) ||
      referenceSolution.length === 0 ||
      visibleTestCases.length === 0
    ) {
      return res
        .status(400)
        .send(
          'referenceSolution and visibleTestCases are required and cannot be empty',
        );
    }
    // then again same as the createproblem checks if the referecesolution is correct
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      if (!languageId) {
        return res.status(400).json({
          message: `Unsupported language: ${language}`,
        });
      }
      // making a array of objects
      const submissions = visibleTestCases.map((testCase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((result) => result.token);
      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id !== 3) {
          return res.status(400).json({
            message: `${language} reference solution failed on visible test cases.`,
            error: test,
          });
        }
      }
    }
    // if the code reaches here that means there is no problem in the solution

    const newProblem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body }, // update these fields
      { runValidators: true, new: true },
    );
    // normally in update operation the validators are not run by themselves so we have to make the runvalidators true ,and the new: true , tells to return the updated document not the previous one

    res.status(200).send(newProblem);
  } catch (error) {
    res.status(500).send('Error: ' + err.message);
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send('Missing Id...');
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      return res.status(404).send('Problem not Available...');
    }
    res.status(200).send('deletedProblem');
  } catch (err) {
    res.status(404).send('Error : ' + err);
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send('Missing Id...');
    }

    const getProblem = await Problem.findById(id).select(
      'title description difficulty tags visibleTestCases starterCode referenceSolution _id',
    );

    if (!getProblem) {
      return res.status(404).send('Problem not Available...');
    }
    //Turn the Mongoose result into a normal object because we're going to add some extra properties to it, and we want those extra properties to appear in the API response.(ad-hoc)
    const responseProblem = getProblem.toObject();

    return res.status(200).send(responseProblem);
  } catch (error) {
    res.status(404).send('Error : ' + err);
  }
};

const getAllProblem = async (req, res) => {
  try {
    const getProblem = await Problem.find({}).select(
      '_id title difficulty tags',
    );
    // because the retured thing will be an array
    if (getProblem.length == 0) {
      return res.status(404).send('Problem not Available...');
    }
    res.status(200).send(getProblem);
  } catch (err) {
    res.status(404).send('Error : ' + err);
  }
};

module.exports = { createProblem, updateProblem, deleteProblem };
