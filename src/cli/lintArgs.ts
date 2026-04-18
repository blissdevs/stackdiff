export interface LintArgs {
  files: string[];
  rules: string[];
  failOnIssues: boolean;
  json: boolean;
}

export function parseLintArgs(argv: string[]): LintArgs {
  const files: string[] = [];
  const rules: string[] = [];
  let failOnIssues = false;
  let json = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--fail') {
      failOnIssues = true;
    } else if (arg === '--json') {
      json = true;
    } else if (arg === '--rule' || arg === '-r') {
      const next = argv[++i];
      if (next) rules.push(next);
    } else if (!arg.startsWith('--')) {
      files.push(arg);
    }
  }

  return { files, rules, failOnIssues, json };
}

export function hasLintRuleFilter(args: LintArgs): boolean {
  return args.rules.length > 0;
}
