'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { createRequire } = require('module');

const mode = process.argv[2] || 'dev';
const supportedModes = new Set(['dev', 'build']);
if (!supportedModes.has(mode)) {
  console.error(`Unsupported mode "${mode}". Use "dev" or "build".`);
  process.exit(1);
}

const skipBackend =
  mode === 'build' &&
  (String(process.env.SKIP_BACKEND).toLowerCase() === 'true' ||
    process.env.SKIP_BACKEND === '1' ||
    process.env.VERCEL === '1');

const repoRoot = path.resolve(__dirname, '..');
const frontendDir = path.join(repoRoot, 'frontend');
const venvDir = path.join(repoRoot, '.venv');
const requirementsFile = path.join(repoRoot, 'requirements.txt');
const isWindows = process.platform === 'win32';
const venvPython = isWindows
  ? path.join(venvDir, 'Scripts', 'python.exe')
  : path.join(venvDir, 'bin', 'python');
const frontendRequire = createRequire(path.join(frontendDir, 'package.json'));

const manualPackages = [
  { spec: 'google-generativeai', withDeps: true },
  { spec: 'google-ai-generativelanguage', withDeps: true },
  { spec: 'langchain-google-genai==3.0.0', withDeps: false },
];

function normalizeSpec(spec) {
  return spec.trim().toLowerCase();
}

const manualSpecs = new Set(manualPackages.map((pkg) => normalizeSpec(pkg.spec)));

function resolveNextCli() {
  try {
    const nextPackageJson = frontendRequire.resolve('next/package.json');
    return path.join(path.dirname(nextPackageJson), 'dist', 'bin', 'next');
  } catch (error) {
    return null;
  }
}

/** Runs a command and resolves when it exits cleanly. */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Command "${command} ${args.join(' ')}" exited with code ${code}`,
          ),
        );
      }
    });
  });
}

async function findPythonLauncher() {
  const configured = process.env.PYTHON;
  const candidates = configured
    ? [configured]
    : isWindows
      ? ['python', 'py']
      : ['python3', 'python'];

  for (const candidate of candidates) {
    try {
      await runCommand(candidate, ['--version'], {
        cwd: repoRoot,
        stdio: ['ignore', 'ignore', 'ignore'],
      });
      return candidate;
    } catch (error) {
      if (candidate === candidates[candidates.length - 1]) {
        throw error;
      }
    }
  }

  throw new Error(
    'Unable to locate a Python interpreter. Set the PYTHON environment variable to point to a valid interpreter.',
  );
}

async function findUvBinary() {
  const configured = process.env.UV;
  const candidates = configured
    ? [configured]
    : isWindows
      ? ['uv.exe', 'uv']
      : ['uv'];

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    try {
      await runCommand(candidate, ['--version'], {
        cwd: repoRoot,
        stdio: ['ignore', 'ignore', 'ignore'],
      });
      return candidate;
    } catch (error) {
      // Try next candidate.
    }
  }

  return null;
}

async function ensureVenv() {
  if (fs.existsSync(venvPython)) {
    console.log(`Using existing Python virtual environment at ${venvDir}`);
    return;
  }

  if (!fs.existsSync(requirementsFile)) {
    throw new Error(
      `requirements.txt not found at ${requirementsFile}. Cannot install backend dependencies.`,
    );
  }

  console.log(`Creating Python virtual environment at ${venvDir}...`);
  const launcher = await findPythonLauncher();
  await runCommand(launcher, ['-m', 'venv', venvDir], { cwd: repoRoot });

  if (!fs.existsSync(venvPython)) {
    throw new Error(
      `Virtual environment created, but expected interpreter not found at ${venvPython}.`,
    );
  }

  const uvBinary = await findUvBinary();

  const installWithTool = async (baseArgs, tool, args) => {
    await runCommand(tool, [...baseArgs, ...args], { cwd: repoRoot });
  };

  const runInstallation = async (pkgSpec, { withDeps }) => {
    if (uvBinary) {
      const baseArgs = ['pip', 'install', '--python', venvPython];
      if (!withDeps) {
        baseArgs.push('--no-deps');
      }
      await installWithTool(baseArgs, uvBinary, [pkgSpec]);
      return;
    }

    const args = ['-m', 'pip', 'install'];
    if (!withDeps) {
      args.push('--no-deps');
    }
    await runCommand(venvPython, [...args, pkgSpec], { cwd: repoRoot });
  };

  console.log('Installing manual backend dependencies...');
  for (const pkg of manualPackages) {
    await runInstallation(pkg.spec, pkg);
  }

  const requirementsContent = fs.readFileSync(requirementsFile, 'utf-8');
  const filteredLines = requirementsContent
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return true;
      }
      return !manualSpecs.has(normalizeSpec(trimmed));
    });

  let tempRequirementsPath = null;
  let installTarget = requirementsFile;

  if (filteredLines.length !== requirementsContent.split(/\r?\n/).length) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devjs-'));
    tempRequirementsPath = path.join(tempDir, 'requirements.txt');
    fs.writeFileSync(tempRequirementsPath, filteredLines.join(os.EOL), 'utf-8');
    installTarget = tempRequirementsPath;
  }

  try {
    if (uvBinary) {
      console.log('Installing remaining backend dependencies with uv...');
      await installWithTool(['pip', 'install', '--python', venvPython, '-r'], uvBinary, [
        installTarget,
      ]);
    } else {
      console.warn(
        'uv package manager not found; falling back to pip. Install uv (https://docs.astral.sh/uv/) and set the UV env var to use it.',
      );
      await runCommand(venvPython, ['-m', 'pip', 'install', '-r', installTarget], {
        cwd: repoRoot,
      });
    }
  } finally {
    if (tempRequirementsPath) {
      fs.rmSync(path.dirname(tempRequirementsPath), { recursive: true, force: true });
    }
  }
}

function startUvicorn() {
  const uvicornArgs = ['-m', 'uvicorn', 'frontend.backend.main:app'];
  if (mode === 'dev') {
    uvicornArgs.push('--reload');
  }

  console.log('Starting FastAPI server (uvicorn)...');
  const child = spawn(venvPython, uvicornArgs, {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    uvicornProcess = undefined;
    if (code && code !== 0) {
      console.error(`Uvicorn exited with code ${code}.`);
      process.exitCode = code;
      cleanupAndExit();
    }
  });

  child.on('error', (error) => {
    console.error('Failed to start uvicorn:', error);
    process.exit(1);
  });

  return child;
}

function startNext() {
  const nextArgs =
    mode === 'build' ? ['build', '--turbopack'] : ['dev', '--turbopack'];

  let command = null;
  let args = null;
  let useShell = false;

  const nextCli = resolveNextCli();
  if (nextCli) {
    command = process.execPath;
    args = [nextCli, ...nextArgs];
  } else {
    const nextBinary = path.join(
      frontendDir,
      'node_modules',
      '.bin',
      isWindows ? 'next.cmd' : 'next',
    );
    if (fs.existsSync(nextBinary)) {
      command = nextBinary;
      args = nextArgs;
      useShell = isWindows;
    } else {
      command = isWindows ? 'npx.cmd' : 'npx';
      args = ['next', ...nextArgs];
      useShell = isWindows;
    }
  }

  console.log(`Launching Next.js (${nextArgs[0]})...`);
  const child = spawn(command, args, {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: useShell,
  });

  child.on('error', (error) => {
    console.error('Failed to start Next.js:', error);
    process.exit(1);
  });

  child.on('exit', (code) => {
    nextProcess = undefined;
    process.exitCode = code ?? 0;
    cleanupAndExit();
  });

  return child;
}

let uvicornProcess;
let nextProcess;
let cleaning = false;

function cleanupAndExit(signal) {
  if (cleaning) {
    return;
  }
  cleaning = true;

  const pending = [];

  if (uvicornProcess && uvicornProcess.exitCode === null) {
    pending.push(
      new Promise((resolve) => {
        uvicornProcess.once('exit', resolve);
        uvicornProcess.kill(signal || 'SIGINT');
      }),
    );
  } else {
    uvicornProcess = undefined;
  }

  if (nextProcess && nextProcess.exitCode === null) {
    pending.push(
      new Promise((resolve) => {
        nextProcess.once('exit', resolve);
        nextProcess.kill(signal || 'SIGINT');
      }),
    );
  } else {
    nextProcess = undefined;
  }

  if (pending.length === 0) {
    process.exit(process.exitCode ?? 0);
    return;
  }

  Promise.allSettled(pending).finally(() => {
    process.exit(process.exitCode ?? 0);
  });
}

async function main() {
  try {
    if (!skipBackend) {
      await ensureVenv();
    } else {
      console.log('Skipping backend setup during build.');
    }
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
    return;
  }

  if (!skipBackend) {
    uvicornProcess = startUvicorn();
  }
  nextProcess = startNext();
}

process.on('SIGINT', () => cleanupAndExit('SIGINT'));
process.on('SIGTERM', () => cleanupAndExit('SIGTERM'));

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
