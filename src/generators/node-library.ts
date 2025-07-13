import {
  createChangeDirectoryCommand,
  getExecutionFunctionForOS,
  getNewlineForOs,
  readContent,
  writeContent,
} from "../utils/generator";

import JSON5 from "json5";

export async function main(libraryName: string): Promise<void> {
  console.log("Creating folder directory");
  await setupDirectoryStructure(libraryName);
  console.log("populating index file");
  await writeIndexFile(libraryName);
  console.log("populating test file");
  await writeIndexTestFile(libraryName);
  console.log("updating package.json");
  await updatePackageJson(libraryName);
  console.log("installing npm packages");
  await installNpmPackages(libraryName);
  console.log("configuring typescript");
  await configureTypescript(libraryName);
  console.log("configuring jest");
  await configureJest(libraryName);
}

async function setupDirectoryStructure(libraryName: string): Promise<void> {
  const command = [
    `mkdir ${libraryName}`,
    `cd ${libraryName}`,
    "mkdir src",
    "npm init --yes",
  ].join(" && ");

  const executionFunction = getExecutionFunctionForOS();
  await executionFunction(command);
}

async function writeIndexFile(libraryName: string): Promise<void> {
  const content = `#!/usr/bin/env node
  
  export function add(a:number, b:number): number {
  return a + b;
}
  
console.log(add(2,2));`;

  await writeContent(`${libraryName}/src/index.ts`, content);
}

async function writeIndexTestFile(libraryName: string): Promise<void> {
  const content = `import {add} from "."
  
describe("index", () => {
  it("does add work?", () => {
    const result = add(2, 2);
    expect(result).toBe(4);
  });
});
  `;

  await writeContent(`${libraryName}/src/index.spec.ts`, content);
}

async function updatePackageJson(libraryName: string): Promise<void> {
  const content = await readContent(`${libraryName}/package.json`);
  const object = JSON.parse(content);
  const newScripts = {
    start: "ts-node src/index.ts",
    test: "jest",
    build: "rimraf dist && tsc",
  };
  object.bin = {
    [libraryName]: "dist/index.js",
  };
  object.scripts = newScripts;
  object.files = ["./dist"];
  await writeContent(
    `${libraryName}/package.json`,
    JSON.stringify(object, null, "  ")
  );
}

async function installNpmPackages(libraryName: string): Promise<void> {
  let command = [
    `${createChangeDirectoryCommand(libraryName)}`,
    "npm install --save-dev typescript ts-node jest ts-jest @types/node @types/jest rimraf",
    "npx tsc --init",
    "npx ts-jest config:init",
  ].join(" && ");

  const executionFunction = getExecutionFunctionForOS();
  await executionFunction(command);
}

async function configureTypescript(libraryName: string): Promise<void> {
  const tsConfigFilePath = `./${libraryName}/tsconfig.json`;
  const tsConfig = JSON5.parse(await readContent(tsConfigFilePath));
  tsConfig.compilerOptions.outDir = "dist";
  tsConfig.compilerOptions.rootDir = "src";
  await writeContent(tsConfigFilePath, JSON.stringify(tsConfig, null, "  "));
}

async function configureJest(libraryName: string): Promise<void> {
  const jestConfigFilePath = `./${libraryName}/jest.config.js`;
  const content = await readContent(jestConfigFilePath);
  const lines = content.split(/\r?\n/);
  const newLines = [
    ...lines.slice(0, -1),
    "  testPathIgnorePatterns: ['dist/']",
    ...lines.slice(-1),
  ].join(getNewlineForOs());
  await writeContent(jestConfigFilePath, newLines);
}
