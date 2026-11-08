const Groq = require('groq-sdk');

const solveDoubt = async (req, res) => {
  let disconnected = false;
  // Create an AbortController to allow for manual cancellation of the request
  const abortController = new AbortController();

  try {
    const {
      messages,
      title,
      description,
      testCases,
      startCode,
      userCode,
      language,
    } = req.body;

    // Validating API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        message: 'GROQ_API_KEY is missing',
      });
    }

    // Validating messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: 'Messages must be a non-empty array',
      });
    }

    if (messages.length > 50) {
      return res.status(400).json({
        message: 'Too many messages in conversation',
      });
    }

    const formattedMessages = messages
      .filter(
        (msg) =>
          msg &&
          ['user', 'model'].includes(msg.role) &&
          Array.isArray(msg.parts),
      )
      .map((msg) => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.parts
          .filter((part) => typeof part.text === 'string')
          .map((part) => part.text)
          .join('\n'),
      }))
      .filter((msg) => msg.content.trim().length > 0);

    if (formattedMessages.length === 0) {
      return res.status(400).json({
        message: 'No valid text messages found',
      });
    }

    // Limiting conversation history
    const recentMessages = formattedMessages.slice(-12);

    // System instructions
    const systemInstruction = `
You are an expert Data Structures and Algorithms tutor.

CURRENT PROBLEM:
Title: ${title || 'Not provided'}
Description: ${description || 'Not provided'}
Test Cases: ${JSON.stringify(testCases || [])}
Starter Code: ${startCode || 'Not provided'}

CURRENT USER SUBMISSION:
${userCode || 'The user has not written any code yet.'}

PROGRAMMING LANGUAGE:
${language || 'Not specified'}

YOUR RESPONSIBILITIES:
1. Give hints without immediately revealing solutions.
2. Debug and review submitted code.
3. Explain optimal solutions.
4. Analyze time and space complexity.
5. Suggest alternative approaches.
6. Explain edge cases.
7. Help students understand concepts.

CODE REVIEW RULES:
- Analyze the actual submitted code.
- Identify specific logical errors.
- Explain why code fails.
- Provide corrected code when appropriate.
- Preserve the user's programming language.
- Never claim code passed tests unless actual test results are provided.

RESPONSE FORMATTING:
- Use Markdown.
- Use headings and bullet points where appropriate.
- Put multiline code inside fenced code blocks.
- Specify the programming language.
- Keep explanations outside code blocks.
- Explain algorithms step by step.
- Keep responses clear and concise.

STRICT RULES:
- Only discuss the current DSA problem.
- Encourage learning instead of memorization.
`;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Start streaming from Groq
    const stream = await groq.chat.completions.create(
      {
        model: 'openai/gpt-oss-20b',

        messages: [
          {
            role: 'system',
            content: systemInstruction,
          },
          ...recentMessages,
        ],

        temperature: 0.3,
        max_completion_tokens: 700,
        stream: true,
      },
      {
        signal: abortController.signal,
      },
    );

    // Configure HTTP streaming response
    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.flushHeaders?.();

    // Detect disconnected clients
    res.on('close', () => {
      if (!res.writableEnded) {
        disconnected = true;
        abortController.abort();
      }
    });

    // Forward generated text chunks to frontend
    for await (const chunk of stream) {
      if (disconnected || res.destroyed) {
        break;
      }

      const delta = chunk.choices?.[0]?.delta;
      const content = delta?.content;

      if (typeof content === 'string' && content.length > 0) {
        res.write(content);

        // Flush chunks if Express compression middleware is enabled
        if (typeof res.flush === 'function') {
          res.flush();
        }
      }
    }

    if (!disconnected && !res.destroyed) {
      res.end();
    }
  } catch (err) {
    if (
      disconnected ||
      abortController.signal.aborted ||
      err.name === 'AbortError'
    ) {
      return;
    }

    console.error('Groq Streaming Error:', err);

    // Before streaming starts, send a normal JSON error.
    if (!res.headersSent) {
      if (err.status === 429) {
        return res.status(429).json({
          message: 'AI usage limit reached. Please wait and try again.',
        });
      }

      if (err.status === 401) {
        return res.status(401).json({
          message: 'Invalid Groq API key',
        });
      }

      return res.status(500).json({
        message: 'Something went wrong while communicating with AI',
      });
    }

    // Once streaming starts, the response cannot be replaced with JSON.
    if (!res.destroyed) {
      res.destroy(err);
    }
  }
};

module.exports = solveDoubt;
