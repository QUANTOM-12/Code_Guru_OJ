const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, '../../temp');
const MAX_EXECUTION_TIME = 30000; // 30 seconds
const MAX_MEMORY = '256m';
const MAX_CPU = '0.5';

// Ensure temp directory exists with proper permissions
fs.ensureDirSync(TEMP_DIR, { mode: 0o700 });

// Input validation and sanitization
function validateAndSanitizeInput(code, language, input) {
  const validLanguages = ['python', 'cpp', 'java', 'javascript'];
  
  if (!validLanguages.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid code provided');
  }
  
  if (code.length > 100000) { // 100KB limit
    throw new Error('Code exceeds maximum length of 100KB');
  }
  
  if (input && input.length > 50000) { // 50KB input limit  
    throw new Error('Input exceeds maximum length of 50KB');
  }
  
  // Security: Check for dangerous patterns
  const dangerousPatterns = [
    /system\s*\(/i,
    /exec\s*\(/i, 
    /eval\s*\(/i,
    /import\s+os/i,
    /import\s+subprocess/i,
    /__import__/i,
    /file\s*\(/i,
    /open\s*\(/i,
    /Process/i,
    /Runtime/i,
    /rm\s+-rf/i,
    /delete/i,
    /format/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      throw new Error(`Code contains potentially dangerous operations: ${pattern.source}`);
    }
  }
  
  return {
    code: code.trim(),
    language,
    input: (input || '').trim()
  };
}

async function executeInDocker(code, language, input = '') {
  const jobId = uuidv4();
  const startTime = Date.now();
  
  try {
    console.log(`[${new Date().toISOString()}] Starting execution: Job ${jobId}, Language: ${language}`);
    
    // Validate and sanitize inputs
    const sanitized = validateAndSanitizeInput(code, language, input);
    
    let result;
    switch (language) {
      case 'python':
        result = await executePython(sanitized.code, sanitized.input, jobId);
        break;
      case 'cpp':
        result = await executeCpp(sanitized.code, sanitized.input, jobId);
        break;
      case 'java':
        result = await executeJava(sanitized.code, sanitized.input, jobId);
        break;
      case 'javascript':
        result = await executeJavaScript(sanitized.code, sanitized.input, jobId);
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
    
    const executionTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Execution completed: Job ${jobId}, Time: ${executionTime}ms`);
    
    return {
      ...result,
      executionTime,
      jobId,
      memoryUsed: result.memoryUsed || 0
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Execution failed: Job ${jobId}, Error: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      output: '',
      executionTime,
      jobId
    };
  } finally {
    // Cleanup
    await cleanup(jobId);
  }
}

async function executePython(code, input, jobId) {
  const codeFile = path.join(TEMP_DIR, `${jobId}.py`);
  const inputFile = path.join(TEMP_DIR, `${jobId}_input.txt`);
  
  await fs.writeFile(codeFile, code, { mode: 0o600 });
  await fs.writeFile(inputFile, input, { mode: 0o600 });
  
  // Secure Docker arguments
  const dockerArgs = [
    'run',
    '--rm',
    '--read-only',                    // Read-only filesystem
    '--tmpfs', '/tmp:noexec,size=50m', // Temp with no execution
    '--user', '1001:1001',            // Non-root user  
    '--memory', MAX_MEMORY,
    '--cpus', MAX_CPU,
    '--pids-limit', '50',             // Process limit
    '--network', 'none',              // No network
    '--cap-drop', 'ALL',              // Drop all capabilities
    '--security-opt', 'no-new-privileges',
    '--ulimit', 'nproc=20',
    '--ulimit', 'nofile=50',
    '-v', `${TEMP_DIR}:/app:ro`,      // Read-only mount
    '-w', '/app',
    'python:3.11-alpine',             // Secure minimal image
    'sh', '-c',
    `cp ${jobId}.py ${jobId}_input.txt /tmp/ && cd /tmp && timeout 15s python ${jobId}.py < ${jobId}_input.txt`
  ];
  
  return executeDockerCommand('docker', dockerArgs);
}

async function executeCpp(code, input, jobId) {
  const codeFile = path.join(TEMP_DIR, `${jobId}.cpp`);
  const inputFile = path.join(TEMP_DIR, `${jobId}_input.txt`);
  
  await fs.writeFile(codeFile, code, { mode: 0o600 });
  await fs.writeFile(inputFile, input, { mode: 0o600 });
  
  const dockerArgs = [
    'run', '--rm', '--read-only',
    '--tmpfs', '/tmp:noexec,size=100m',
    '--user', '1001:1001',
    '--memory', MAX_MEMORY, '--cpus', MAX_CPU,
    '--pids-limit', '50', '--network', 'none',
    '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
    '--ulimit', 'nproc=20', '--ulimit', 'nofile=50',
    '-v', `${TEMP_DIR}:/app:ro`, '-w', '/app',
    'gcc:11-alpine',
    'sh', '-c',
    `cp ${jobId}.cpp ${jobId}_input.txt /tmp/ && cd /tmp && g++ -O2 -std=c++17 -o ${jobId} ${jobId}.cpp && timeout 10s ./${jobId} < ${jobId}_input.txt`
  ];
  
  return executeDockerCommand('docker', dockerArgs);
}

async function executeJavaScript(code, input, jobId) {
  const codeFile = path.join(TEMP_DIR, `${jobId}.js`);
  const inputFile = path.join(TEMP_DIR, `${jobId}_input.txt`);
  
  await fs.writeFile(codeFile, code, { mode: 0o600 });
  await fs.writeFile(inputFile, input, { mode: 0o600 });
  
  const dockerArgs = [
    'run', '--rm', '--read-only',
    '--tmpfs', '/tmp:noexec,size=50m',
    '--user', '1001:1001',
    '--memory', MAX_MEMORY, '--cpus', MAX_CPU,
    '--pids-limit', '50', '--network', 'none',
    '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
    '--ulimit', 'nproc=20', '--ulimit', 'nofile=50',
    '-v', `${TEMP_DIR}:/app:ro`, '-w', '/app',
    'node:18-alpine',
    'sh', '-c',
    `cp ${jobId}.js ${jobId}_input.txt /tmp/ && cd /tmp && timeout 15s node ${jobId}.js < ${jobId}_input.txt`
  ];
  
  return executeDockerCommand('docker', dockerArgs);
}

async function executeJava(code, input, jobId) {
  const codeFile = path.join(TEMP_DIR, `${jobId}.java`);
  const inputFile = path.join(TEMP_DIR, `${jobId}_input.txt`);
  
  await fs.writeFile(codeFile, code, { mode: 0o600 });
  await fs.writeFile(inputFile, input, { mode: 0o600 });
  
  const dockerArgs = [
    'run', '--rm', '--read-only',
    '--tmpfs', '/tmp:noexec,size=200m',  // Java needs more memory
    '--user', '1001:1001',
    '--memory', '512m',                  // Java needs more memory
    '--cpus', MAX_CPU,
    '--pids-limit', '50', '--network', 'none',
    '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
    '--ulimit', 'nproc=20', '--ulimit', 'nofile=50',
    '-v', `${TEMP_DIR}:/app:ro`, '-w', '/app',
    'openjdk:17-alpine',
    'sh', '-c',
    `cp ${jobId}.java ${jobId}_input.txt /tmp/ && cd /tmp && javac ${jobId}.java && timeout 10s java Main < ${jobId}_input.txt`
  ];
  
  return executeDockerCommand('docker', dockerArgs);
}

function executeDockerCommand(command, args) {
  return new Promise((resolve) => {
    const process = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: MAX_EXECUTION_TIME
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code, signal) => {
      if (signal === 'SIGTERM' || signal === 'SIGKILL') {
        resolve({
          success: false,
          error: 'Time Limit Exceeded',
          output: 'Execution timed out',
          exitCode: null,
          signal
        });
      } else if (code !== 0) {
        let errorType = 'Runtime Error';
        if (stderr.includes('compilation terminated') || 
            stderr.includes('error:') || 
            stderr.includes('javac:') ||
            stderr.includes('SyntaxError')) {
          errorType = 'Compilation Error';
        }
        
        resolve({
          success: false,
          error: errorType,
          output: stderr || `Process exited with code ${code}`,
          exitCode: code
        });
      } else {
        resolve({
          success: true,
          output: stdout.trim(),
          error: null,
          exitCode: code
        });
      }
    });
    
    process.on('error', (error) => {
      resolve({
        success: false,
        error: 'System Error',
        output: error.message,
        exitCode: null
      });
    });
  });
}

async function cleanup(jobId) {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const jobFiles = files.filter(file => file.startsWith(jobId));
    
    await Promise.all(
      jobFiles.map(file => 
        fs.remove(path.join(TEMP_DIR, file)).catch(err => 
          console.error(`Failed to remove file ${file}:`, err.message)
        )
      )
    );
  } catch (error) {
    console.error(`Cleanup error for job ${jobId}:`, error.message);
  }
}

module.exports = { executeInDocker };