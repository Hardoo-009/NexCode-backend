const { GoogleGenAI } = require('@google/genai');

const solveDoubt = async (req, res) => {
  try {
    const { messages, title, description, testCases, startCode } = req.body;
    if (!process.env.GEMINI_KEY) {
      return res.status(500).json({
        message: 'GEMINI_KEY is missing from environment variables',
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: 'Messages must be a non-empty array',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_KEY,
    });
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role !== 'user') {
      return res.status(400).json({
        message: 'Last message must be from the user',
        receivedRoles: messages.map((msg) => msg.role),
      });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: messages,
      config: {
        systemInstruction: `
You are an expert DSA tutor.

Problem: ${title}
Description: ${description}
Test Cases: ${JSON.stringify(testCases)}
Starter Code: ${startCode}

Help users with:
1. DSA hints
2. Code debugging
3. Optimal solutions
4. Time and space complexity
5. Different approaches

Only answer questions related to the current DSA problem.
Explain concepts clearly and use Markdown.
`,
      },
    });

    return res.status(200).json({
      message: response.text,
    });
  } catch (err) {
    console.error('Gemini Error:', err);

    return res.status(500).json({
      message: err.message || 'Gemini API failed',
    });
  }
};

module.exports = solveDoubt;
