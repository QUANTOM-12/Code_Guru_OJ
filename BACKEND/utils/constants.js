exports.SUBMISSION_STATUS = {
  PENDING: 'Pending',
  RUNNING: 'Running',
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED: 'Memory Limit Exceeded',
  RUNTIME_ERROR: 'Runtime Error',
  COMPILATION_ERROR: 'Compilation Error',
  INTERNAL_ERROR: 'Internal Error'
};

exports.SUPPORTED_LANGUAGES = ['cpp', 'java', 'python', 'javascript'];

exports.DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

exports.USER_ROLES = ['user', 'admin'];

exports.DEFAULT_POINTS = {
  Easy: 100,
  Medium: 200,
  Hard: 300
};
