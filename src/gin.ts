#!/usr/bin/env node
import { Command } from "commander";
import { main as generator } from "./utils/generator";

async function main(): Promise<void> {
  const program = new Command();

  program
    .command("create")
    .description("Creates a template node project")
    .argument("<projectName>", "name of project")
    .action(async (projectName: string) => {
      await generator(projectName);
    })
    .exitOverride();
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    console.log("Failed", err);
  }
}

main();
