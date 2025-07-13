#!/usr/bin/env node
import { Command } from "commander";
import { main as projectGenerator } from "./generators/node-project";
import { main as libraryGenerator } from "./generators/node-library";
async function main(): Promise<void> {
  const program = new Command();

  program
    .command("create")
    .description("Creates a scaffolded application")
    .argument("<type>", "type to create (project or library)")
    .argument("<name>", "name of the application to create")
    .action(async (type: string, name: string) => {
      switch (type) {
        case "library":
          await libraryGenerator(name);
          break;
        case "project":
          await projectGenerator(name);
          break;
        default:
          console.error("need to specify project or library");
          break;
      }
    })
    .exitOverride();
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    console.log("Failed", err);
  }
}

main();
