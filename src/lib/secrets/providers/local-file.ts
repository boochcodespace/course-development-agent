import { SecretsProvider } from '../provider';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const SECRETS_FILENAME = '.claude-secrets.json';
const REQUIRED_MODE = 0o600;

function getSecretsPath(): string {
  return path.resolve(process.cwd(), SECRETS_FILENAME);
}

function getGitignorePath(): string {
  return path.resolve(process.cwd(), '.gitignore');
}

function isInGitignore(): boolean {
  const gitignorePath = getGitignorePath();
  if (!fs.existsSync(gitignorePath)) return false;
  const content = fs.readFileSync(gitignorePath, 'utf-8');
  return content.split('\n').some(
    (line: string) => line.trim() === SECRETS_FILENAME || line.trim() === `/${SECRETS_FILENAME}`
  );
}

function checkPermissions(filePath: string): boolean {
  if (os.platform() === 'win32') return true;
  try {
    const stat = fs.statSync(filePath);
    const mode = stat.mode & 0o777;
    return mode === REQUIRED_MODE;
  } catch {
    return false;
  }
}

function readSecretsFile(): Record<string, string> | null {
  const filePath = getSecretsPath();
  if (!fs.existsSync(filePath)) return null;

  if (!checkPermissions(filePath)) {
    console.warn(
      `[secrets] ${SECRETS_FILENAME} has permissions broader than 0600. ` +
      `Refusing to read. Run: chmod 600 ${filePath}`
    );
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    console.warn(`[secrets] Failed to parse ${SECRETS_FILENAME}. File may be corrupted.`);
    return null;
  }
}

function logWriteDiagnostics(filePath: string, tmpPath: string): void {
  const dir = path.dirname(filePath);
  const gitignoreOk = isInGitignore();
  let dirExists = false;
  let dirWritable = false;

  try {
    const stat = fs.statSync(dir);
    dirExists = stat.isDirectory();
  } catch { /* dir stat failed */ }

  if (dirExists) {
    try {
      fs.accessSync(dir, fs.constants.W_OK);
      dirWritable = true;
    } catch { /* not writable */ }
  }

  console.error('[secrets] Write diagnostics:');
  console.error(`  cwd:          ${process.cwd()}`);
  console.error(`  filePath:     ${filePath}`);
  console.error(`  tmpPath:      ${tmpPath}`);
  console.error(`  gitignore ok: ${gitignoreOk}`);
  console.error(`  dir exists:   ${dirExists}`);
  console.error(`  dir writable: ${dirWritable}`);
}

function writeSecretsFile(data: Record<string, string>): void {
  const filePath = getSecretsPath();
  const dir = path.dirname(filePath);
  const tmpPath = path.join(dir, `${SECRETS_FILENAME}.writing`);

  if (!isInGitignore()) {
    logWriteDiagnostics(filePath, tmpPath);
    throw new Error(
      `${SECRETS_FILENAME} is not in .gitignore. ` +
      `Add it to .gitignore before writing secrets. Refusing to write.`
    );
  }

  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2) + '\n', {
      encoding: 'utf-8',
      mode: REQUIRED_MODE,
    });

    fs.renameSync(tmpPath, filePath);

    if (os.platform() !== 'win32') {
      try {
        fs.chmodSync(filePath, REQUIRED_MODE);
      } catch {
        // Best-effort on systems that don't support chmod
      }
    }
  } catch (err) {
    logWriteDiagnostics(filePath, tmpPath);
    console.error('[secrets] Write failed:', err);
    throw err;
  }
}

export class LocalFileSecretsProvider implements SecretsProvider {
  async get(key: string): Promise<string | null> {
    const data = readSecretsFile();
    if (!data) return null;
    return data[key] ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    const data = readSecretsFile() || {};
    data[key] = value;
    writeSecretsFile(data);
  }

  async delete(key: string): Promise<void> {
    const data = readSecretsFile();
    if (!data || !(key in data)) return;
    delete data[key];
    writeSecretsFile(data);
  }

  async list(): Promise<string[]> {
    const data = readSecretsFile();
    if (!data) return [];
    return Object.keys(data);
  }

  async isConfigured(): Promise<boolean> {
    const keys = await this.list();
    return keys.some(
      (k) => k === 'ANTHROPIC_API_KEY' || k === 'GOOGLE_API_KEY'
    );
  }
}
