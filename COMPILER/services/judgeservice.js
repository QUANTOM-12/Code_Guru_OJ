exports.evaluate = (output, expected, stderr, error) => {
  if (error) return 'Runtime Error';
  if (stderr && stderr.trim()) return 'Compilation Error';
  if ((output || '').trim() === (expected || '').trim()) return 'Accepted';
  return 'Wrong Answer';
};