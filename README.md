# cnpj-api / skills

Agent Skills for querying Brazilian company data via the [cnpj-api.com](https://cnpj-api.com) REST API.

Teach Claude Code, Cursor, Codex, Windsurf, OpenCode, and any other [Agent Skills](https://agentskills.io)-compatible agent to look up CNPJs, check Simples Nacional status, enrich supplier lists, and work with sócios, CNAEs, and IBGE city data — all in one command.

## Install

```bash
npx skills add cnpj-api/skills
```

The CLI places the skill files in the right directory for your agent (`.claude/skills/`, `.cursor/skills/`, etc.).

## Manual install

```bash
git clone https://github.com/cnpj-api/skills
cp -r skills/cnpj-api .claude/skills/
```

## What's included

A single skill — `cnpj-api` — covering 8 endpoints:

- `GET /v1/cnpj/{cnpj}` — company profile
- `POST /v1/bulk-cnpj` — batch lookup (Pro)
- `GET /v1/simples/{cnpj}` — Simples Nacional status
- `GET /v1/socios/{pessoaId}` — partner profile
- `GET /v1/cidades/{id}` — IBGE city aggregates
- `GET /v1/cnae/{cnae}` — industry aggregates
- `GET /v1/usage` — plan + rate limit

Plus bundled helper scripts:

- `validate-cnpj.ts` — check-digit validation
- `bulk-lookup.ts` — chunked batch enrichment with rate-limit backoff

## Setup

1. Create a free account at [cnpj-api.com](https://cnpj-api.com)
2. Generate a token
3. Set `CNPJ_API_TOKEN` in your environment:

```bash
export CNPJ_API_TOKEN="your-token-here"
```

## Documentation

- Full skill docs: [cnpj-api.com/docs/ai/skills](https://cnpj-api.com/docs/ai/skills)
- API reference: [docs.cnpj-api.com](https://docs.cnpj-api.com)
- Agent Skills spec: [agentskills.io](https://agentskills.io)

## License

[MIT](./LICENSE)

## Contributing

Issues and PRs welcome. If you add a new recipe or endpoint reference, keep `SKILL.md` under 500 lines and push detail into `references/`.
