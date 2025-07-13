import {
  createChangeDirectoryCommand,
  getExecutionFunctionForOS,
  readContent,
  writeContent,
} from "../utils/generator";

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

async function installNpmPackages(projectName: string): Promise<void> {
  let command = [
    createChangeDirectoryCommand(projectName),
    "npm install --save-dev typescript ts-node jest ts-jest @types/node @types/jest",
  ].join(" && ");

  const executionFunction = getExecutionFunctionForOS();
  await executionFunction(command);
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

async function updatePackageJson(projectName: string): Promise<void> {
  const content = await readContent(`${projectName}/package.json`);
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

async function configureTypescript(projectName: string): Promise<void> {
  const command = [
    createChangeDirectoryCommand(projectName),
    "npx tsc --init",
  ].join(" && ");
  const executionFunction = getExecutionFunctionForOS();
  await executionFunction(command);
}

async function configureJest(projectName: string): Promise<void> {
  const command = [
    createChangeDirectoryCommand(projectName),
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
  console.log("configuring typescript");
  await configureTypescript(projectName);
  console.log("configuring Jest");
  await configureJest(projectName);
}
