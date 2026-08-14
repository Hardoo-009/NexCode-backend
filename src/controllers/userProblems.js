const { getLanguageById, submitBatch } = require('../utils/problemUtility');

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
    }
  } catch (error) {}
};
