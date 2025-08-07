const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

const TMP_DIR = path.join(__dirname, '../../temp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

exports.runCodeInDocker = (code, language, input) => new Promise((resolve, reject) => {
  const jobId = uuidv4();
  let fileExt, image, compileCmd, runCmd;

  if (language === 'cpp') {
    fileExt = 'cpp';
    image = 'gcc:9';
    compileCmd = `g++ ${jobId}.cpp -o ${jobId}`;
    runCmd = `timeout 2s ./${jobId}`;
  } else if (language === 'python') {
    fileExt = 'py';
    image = 'python:3.11';
    compileCmd = null;
    runCmd = `timeout 2s python3 ${jobId}.py`;
  } else {
    return reject('Language not supported');
  }

  const codePath = path.join(TMP_DIR, `${jobId}.${fileExt}`);
  const inputPath = path.join(TMP_DIR, `${jobId}_input.txt`);
  fs.writeFileSync(codePath, code);
  fs.writeFileSync(inputPath, input || '');

  // Compose Docker command
  let cmd = (language === 'cpp') ?
    `docker run --rm -v ${TMP_DIR}:/app -w /app ${image} bash -c "${compileCmd} && (${runCmd} < ${jobId}_input.txt)"` :
    `docker run --rm -v ${TMP_DIR}:/app -w /app ${image} bash -c "(${runCmd} < ${jobId}_input.txt)"`;

  exec(cmd, { timeout: 3000 }, (error, stdout, stderr) => {
    try { fs.unlinkSync(codePath); fs.unlinkSync(inputPath); } catch {}
    if (error && !stdout) return resolve({ error, stdout: '', stderr });
    resolve({ error: null, stdout, stderr });
  });
});