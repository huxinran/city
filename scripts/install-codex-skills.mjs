#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillsRoot = process.env.CODEX_HOME
  ? path.join(process.env.CODEX_HOME, 'skills')
  : path.join(os.homedir(), '.codex', 'skills');
const backupRoot = path.join(path.dirname(skillsRoot), 'skill-install-backups');
const toolsRoot = path.join(repoRoot, 'tools');
const mode = process.argv.includes('--copy') ? 'copy' : 'symlink';

function timestamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
}

function skillDirs() {
  return fs
    .readdirSync(toolsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(toolsRoot, entry.name))
    .filter((dir) => fs.existsSync(path.join(dir, 'SKILL.md')));
}

function removeStaleRepoSkillLinks(validDirs) {
  if (!fs.existsSync(skillsRoot)) return;

  const valid = new Set(validDirs);
  for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
    const linkPath = path.join(skillsRoot, entry.name);
    if (!entry.isSymbolicLink()) continue;

    const target = path.resolve(path.dirname(linkPath), fs.readlinkSync(linkPath));
    const isRepoTool = target.startsWith(`${toolsRoot}${path.sep}`);
    if (isRepoTool && !valid.has(target)) {
      fs.unlinkSync(linkPath);
      console.log(`remove stale link ${entry.name}: ${linkPath} -> ${target}`);
    }
  }
}

function moveInstallBackupsOutOfSkillsRoot() {
  if (!fs.existsSync(skillsRoot)) return;

  for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.name.includes('.backup-')) continue;

    const source = path.join(skillsRoot, entry.name);
    const target = path.join(backupRoot, entry.name);
    fs.mkdirSync(backupRoot, { recursive: true });
    fs.renameSync(source, target);
    console.log(`move backup out of skills root: ${source} -> ${target}`);
  }
}

function installSkill(sourceDir) {
  const name = path.basename(sourceDir);
  const targetDir = path.join(skillsRoot, name);
  fs.mkdirSync(skillsRoot, { recursive: true });

  if (fs.existsSync(targetDir)) {
    const stat = fs.lstatSync(targetDir);
    if (stat.isSymbolicLink()) {
      const current = path.resolve(path.dirname(targetDir), fs.readlinkSync(targetDir));
      if (current === sourceDir && mode === 'symlink') {
        console.log(`ok ${name}: already linked`);
        return;
      }
    }

    fs.mkdirSync(backupRoot, { recursive: true });
    const backupDir = path.join(backupRoot, `${name}.backup-${timestamp()}`);
    fs.renameSync(targetDir, backupDir);
    console.log(`backup ${name}: moved existing install to ${backupDir}`);
  }

  if (mode === 'copy') {
    fs.cpSync(sourceDir, targetDir, { recursive: true });
    console.log(`copy ${name}: ${sourceDir} -> ${targetDir}`);
  } else {
    fs.symlinkSync(sourceDir, targetDir, 'dir');
    console.log(`link ${name}: ${targetDir} -> ${sourceDir}`);
  }
}

const dirs = skillDirs();
if (dirs.length === 0) {
  console.error(`No Codex skills found under ${toolsRoot}`);
  process.exit(1);
}

moveInstallBackupsOutOfSkillsRoot();
removeStaleRepoSkillLinks(dirs);

for (const dir of dirs) {
  installSkill(dir);
}
