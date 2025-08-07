const express = require('express');
const { compileAndJudge } = require('../controllers/controller');
const router = express.Router();

router.post('/run', compileAndJudge);

module.exports = router;