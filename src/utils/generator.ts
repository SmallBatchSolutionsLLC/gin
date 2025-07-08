import { promises as fs } from "node:fs";
import { exec } from "child_process";
import util from "node:util";

async function writeContent(fileName: string, content: string): Promise<void> {
  await fs.writeFile(fileName, content);
}

async function executeWindowsCommand(command: string): Promise<void> {
  const promiseExec = util.promisify(exec);
  await promiseExec(`cmd.exe /c ${command}`);
}

async function executeLinuxCommand(command: string): Promise<void> {
  const promiseExec = util.promisify(exec);
  await promiseExec(`${command}`);
}

async function writeIndexFile(projectName: string): Promise<void> {
  const content = `export function add(a:number, b:number): number {
  return a + b;
}
  
console.log(add(2,2));`;

  await writeContent(`${projectName}/src/index.ts`, content);
}

async function writeIndexTestFile(projectName: string): Promise<void> {
  const content = `import {add} from "."
  
describe("index", () => {
  it("does add work?", () => {
    const result = add(2, 2);
    expect(result).toBe(4);
  });
});
  `;

  await writeContent(`${projectName}/src/index.spec.ts`, content);
}

async function updatePackageJson(projectName: string): Promise<void> {
  const content = await fs.readFile(`${projectName}/package.json`, {
    encoding: "utf-8",
  });
  const object = JSON.parse(content) as { scripts: { test: string } };
  const newScripts = {
    start: "ts-node src/index.ts",
    test: "jest",
  };
  object.scripts = newScripts;
  await writeContent(
    `${projectName}/package.json`,
    JSON.stringify(object, null, "  ")
  );
}

function getExecutionFunctionForOS(): (cmd: string) => Promise<void> {
  return process.platform === "win32"
    ? executeWindowsCommand
    : executeLinuxCommand;
}

async function setupDirectoryStructure(projectName: string): Promise<void> {
  const command = [
    `mkdir ${projectName}`,
    `cd ${projectName}`,
    "mkdir src",
    "npm init --yes",
  ].join(" && ");

  const executionFunction = getExecutionFunctionForOS();
  await executionFunction(command);
}

async function installNpmPackages(projectName: string): Promise<void> {
  const command = [
    "",
    `cd ${projectName}`,
    "npm install --save-dev typescript ts-node jest ts-jest @types/node @types/jest",
    "npx tsc --init",
    "npx ts-jest config:init",
  ].join(" && ");

  const executionFunction = getExecutionFunctionForOS();
  await executionFunction(command);
}

export async function main(projectName: string): Promise<void> {
  console.log("Creating folder directory");
  await setupDirectoryStructure(projectName);
  console.log("populating index file");
  await writeIndexFile(projectName);
  console.log("populating test file");
  await writeIndexTestFile(projectName);
  console.log("updating package.json");
  await updatePackageJson(projectName);
  console.log("installing npm packages");
  await installNpmPackages(projectName);
}
