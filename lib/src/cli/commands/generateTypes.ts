import * as fs from "node:fs/promises";
import type { ClientFeaturesResponse } from "unleash-client";
import type { Command } from "@commander-js/extra-typings";
import { fetchDefinitions, intro, step, version } from "../helpers";
import { typesFromDefinitions } from "../typesFromDefinitions";

const banner = `/**\n* Generated by @unleash/nextjs v${version}\n* Do not edit manually.\n*/\n\n`;
export const typedExports = {
  imports: `import {
    type IToggle,
    useFlag as useFlagOriginal,
    useVariant as useVariantOriginal,
    useFlags as useFlagsOriginal,
    flagsClient as flagsClientOriginal,
  } from "@unleash/nextjs/client";`,
  body: `
  export const useFlag = useFlagOriginal<FeatureName>;
  export const useVariant = <T extends FeatureName>(name: T) =>
    useVariantOriginal<T, FeatureVariants[T][number]>(name);
  export const useFlags = useFlagsOriginal<Features>;
  export const flagsClient = (toggles: IToggle[]) => {
    const output = flagsClientOriginal(toggles);
    return {
      isEnabled: (name: FeatureName) => output.isEnabled(name),
      getVariant: <T extends FeatureName>(name: T) =>
        output.getVariant(name) as FeatureVariants[T][number],
    };
  };
  `,
};

export const generateTypes = (program: Command) => {
  program
    .command("generate-types")
    .summary("Generate types and typed functions from feature flags.")
    .description(
      "Generate types and typed functions from feature flags defined in an Unleash instance. " +
      "It will also generate strictly typed versions of `useFlag`, `useVariant`, `useFlags` and `flagsClient` (unless `--typesOnly` is used)."
    )
    .argument("<file>", "output file name (e.g. `./generated/unleash.ts`)")
    .option(
      "-t, --typesOnly",
      "don't include typed versions of functions exported from `@unleash/nextjs`",
      false
    )
    .option(
      "-b, --bootstrap <sourceFile>",
      "load definitions from a file instead of fetching definitions (work offline)"
    )
    .action(async (file, options) => {
      console.log(intro);

      let definitions: ClientFeaturesResponse;
      if (options.bootstrap) {
        step("- Loading feature toggle definitions from file");
        step("source file:", options.bootstrap);
        const source = (await fs.readFile(options.bootstrap)).toString();
        definitions = JSON.parse(source);
      } else {
        definitions = await fetchDefinitions();
      }

      const withVariant = definitions?.features.filter(
        ({ variants }) => (variants || []).length > 0
      ).length;
      step(
        "found feature toggle definitions:",
        `${definitions?.features.length}`
      );
      step("found definitions with variants:", `${withVariant}`);

      step("- Generating types");
      const types = typesFromDefinitions(definitions);

      step(`- Writing types to file`);
      let output = banner;
      if (!options.typesOnly) {
        output += typedExports.imports + "\n\n";
      }
      output += types;
      if (!options.typesOnly) {
        output += typedExports.body;
      }
      step(`output:`, file);
      await fs.writeFile(file, output);
    });

  return program;
};
