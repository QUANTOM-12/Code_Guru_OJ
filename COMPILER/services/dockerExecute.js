const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, '../../temp');

// Ensure temp directory exists
fs.ensureDirSync(TEMP_DIR);

async function executeInDocker(code, language, input) {
  const jobId = uuidv4();
  const startTime = Date.now();

  try {
    let result;
    
    switch (language) {
      case 'python':
        result = await executePython(code, input, jobId);
        break;
      case 'cpp':
        result = await executeCpp(code, input, jobId);
        break;
      case 'java':
        result = await executeJava(code, input, jobId);
        break;
      case 'javascript':
        result = await executeJavaScript(code, input, jobId);
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    return {
      ...result,
      executionTime: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      executionTime: Date.now() - startTime
    };
  } finally {
    // Cleanup temp files
    cleanup(jobId);
  }
}

async function executePython(code, input, jobId) {
  const codeFile = path.join(TEMP_DIR, `${jobId}.py`);
  const inputFile = path.join(TEMP_DIR, `${jobId}_input.txt`);

  // Write files
  await fs.writeFile(codeFile, code);
  await fs.writeFile(inputFile, input);

  // Docker command for Python
  const dockerCommand = `docker run --rm -v "${TEMP_DIR}:/app" -w /app --memory=128m --cpus="0.5" --network none --timeout 10s python:3.9-slim python ${jobId}.py < ${jobId}_input.txt`;

  return executeDockerCommand(dockerCommand);
}

async function executeCpp(code, input, jobId) {
  const codeFile = path.join(TEMP_DIR, `${jobId}.cpp`);
  const inputFile = path.join(TEMP_DIR, `${jobId}_input.txt`);

  await fs.writeFile(codeFile, code);
  await fs.writeFile(inputFile, input);

  // Docker command for C++
  const dockerCommand = `docker run --rm -v "${TEMP_DIR}:/app" -w /app --memory=128m --cpus="0.5" --network none gcc:9 bash -c "g++ ${jobId}.cpp -o ${jobId} && timeout 5s ./${jobId} < ${jobId}_input.txt"`;

  return executeDockerCommand(dockerCommand);
}

async function executeJavaScript(code, input, jobId) {
  const codeFile = path.join(TEMP_DIR, `${jobId}.js`);
  const inputFile = path.join(TEMP_DIR, `${jobId}_input.txt`);

  await fs.writeFile(codeFile, code);
  await fs.writeFile(inputFile, input);

  const dockerCommand = `docker run --rm -v "${TEMP_DIR}:/app" -w /app --memory=128m --cpus="0.5" --network none node:16-slim node ${jobId}.js < ${jobId}_input.txt`;

  return executeDockerCommand(dockerCommand);
}

async function executeJava(code, input, jobId) {
  const codeFile = path.join(TEMP_DIR, `${jobId}.java`);
  const inputFile = path.join(TEMP_DIR, `${jobId}_input.txt`);

  await fs.writeFile(codeFile, code);
  await fs.writeFile(inputFile, input);

  const dockerCommand = `docker run --rm -v "${TEMP_DIR}:/app" -w /app --memory=128m --cpus="0.5" --network none openjdk:11-slim bash -c "javac ${jobId}.java && timeout 5s java ${path.parse(jobId).name} < ${jobId}_input.txt"`;

  return executeDockerCommand(dockerCommand);
}

function executeDockerCommand(command) {
  return new Promise((resolve) => {
    exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        // Handle different types of errors
        if (error.killed) {
          resolve({
            success: false,
            error: 'Time Limit Exceeded',
            output: 'Code execution timed out'
          });
        } else if (stderr && stderr.includes('compilation terminated')) {
          resolve({
            success: false,
            error: 'Compilation Error',
            output: stderr
          });
        } else {
          resolve({
            success: false,
            error: 'Runtime Error',
            output: stderr || error.message
          });
        }
      } else {
        resolve({
          success: true,
          output: stdout.trim(),
          error: null
        });
      }
    });
  });
}

function cleanup(jobId) {
  try {
    const patterns = [
      `${jobId}.*`,
      `${jobId}_*`
    ];
    
    patterns.forEach(pattern => {
      const files = fs.readdirSync(TEMP_DIR).filter(file => 
        file.startsWith(jobId)
      );
      files.forEach(file => {
        fs.removeSync(path.join(TEMP_DIR, file));
      });
    });
  } catch (error) {
    // Ignore cleanup errors
  }
}

module.exports = { executeInDocker };