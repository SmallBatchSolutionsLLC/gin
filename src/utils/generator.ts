import { promises as fs } from "node:fs";
import os from "node:os";
import { exec } from "child_process";
import util from "node:util";

export async function writeContent(
  fileName: string,
  content: string
): Promise<void> {
  await fs.writeFile(fileName, content);
}

export async function readContent(fileName: string): Promise<string> {
  const content = await fs.readFile(fileName, {
    encoding: "utf-8",
  });
  return content;
}

async function executeWindowsCommand(command: string): Promise<void> {
  const promiseExec = util.promisify(exec);
  await promiseExec(`cmd.exe /c ${command}`);
}

async function executeLinuxCommand(command: string): Promise<void> {
  const promiseExec = util.promisify(exec);
  await promiseExec(`${command}`);
}

function isWindows(): boolean {
  return process.platform === "win32";
}

export function getExecutionFunctionForOS(): (cmd: string) => Promise<void> {
  return isWindows() ? executeWindowsCommand : executeLinuxCommand;
}
export function createChangeDirectoryCommand(projectName: string): string {
  return `${isWindows() ? "&&" : ""} cd ${projectName}`;
}

export function getNewlineForOs(): string {
  return os.EOL;
}
