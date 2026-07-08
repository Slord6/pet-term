#!/usr/bin/env node

import { runApp } from "./app.js";
import { buildHelpText, mergeRunAppOptions, parseArgs, readDotEnvOptions, readEnvOptions } from "./config.js";

async function main(): Promise<void> {
  const { rootArg, options: cliOptions, showHelp } = parseArgs(process.argv.slice(2));

  if (!rootArg || showHelp) {
    process.stdout.write(`${buildHelpText()}\n`);
    process.exit(showHelp ? 0 : 1);
  }

  const options = mergeRunAppOptions(
    mergeRunAppOptions(await readDotEnvOptions(rootArg), readEnvOptions(process.env)),
    cliOptions
  );

  try {
    await runApp(rootArg, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
}

void main();
