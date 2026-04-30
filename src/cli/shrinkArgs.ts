import { parseArgs } from "util";

export type ShrinkArgs = {
  keepEmpty: boolean;
  keepPlaceholders: boolean;
  customPlaceholders: string[];
  json: boolean;
};

export function parseShrinkArgs(argv: string[]): ShrinkArgs {
  const { values } = parseArgs({
    args: argv,
    options: {
      "keep-empty": { type: "boolean", default: false },
      "keep-placeholders": { type: "boolean", default: false },
      placeholder: { type: "string", multiple: true },
      json: { type: "boolean", default: false },
    },
    strict: false,
  });

  return {
    keepEmpty: (values["keep-empty"] as boolean) ?? false,
    keepPlaceholders: (values["keep-placeholders"] as boolean) ?? false,
    customPlaceholders: ((values["placeholder"] as string[]) ?? []),
    json: (values["json"] as boolean) ?? false,
  };
}

export function hasShrinkOptions(args: ShrinkArgs): boolean {
  return (
    args.keepEmpty ||
    args.keepPlaceholders ||
    args.customPlaceholders.length > 0 ||
    args.json
  );
}
