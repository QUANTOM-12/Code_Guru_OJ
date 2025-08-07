const { runCodeInDocker } = require('../services/dockerService');
const { evaluate } = require('../services/judgeservice.js');

exports.compileAndJudge = async (req, res) => {
  const { code, language, input, testCases = [] } = req.body;
  if (!code || !language) return res.status(400).json({ error: 'Missing code/language' });

  try {
    let results = [];
    for (let test of testCases) {
      const { stdout, stderr, error } = await runCodeInDocker(code, language, test.input || input);
      const verdict = evaluate(stdout, test.output, stderr, error);
      results.push({ input: test.input, expected: test.output, output: stdout, verdict });
      if (verdict !== 'Accepted') break; // Stop on first failure for efficiency
    }
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};
