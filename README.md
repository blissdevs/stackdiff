# stackdiff

> CLI tool to compare environment variable sets across `.env` files and deployment configs

## Installation

```bash
npm install -g stackdiff
```

## Usage

Compare two environment files or deployment configs:

```bash
stackdiff .env.staging .env.production
```

**Example output:**

```
✔ Matching keys:  DATABASE_URL, PORT, NODE_ENV
✘ Missing in .env.production:  STRIPE_TEST_KEY, DEBUG_MODE
✘ Missing in .env.staging:     NEW_RELIC_LICENSE_KEY
```

You can also diff against deployment configs:

```bash
stackdiff .env.local vercel.json
stackdiff .env.production fly.toml
```

### Options

| Flag | Description |
|------|-------------|
| `--values` | Show values side-by-side (redacted by default) |
| `--missing-only` | Only show keys missing from either file |
| `--json` | Output results as JSON |

```bash
stackdiff .env.staging .env.production --missing-only --json
```

## License

MIT