---
name: cnpj-api
description: Query Brazilian company data (CNPJ, Cadastro Nacional da Pessoa Jurídica) from Receita Federal via the cnpj-api.com REST API. Use this skill whenever the user asks about a Brazilian company, supplier, CNPJ lookup, Simples Nacional status (MEI, ME, EPP), sócios (partners, shareholders, quadro societário), CNAE (industry classification), IBGE city aggregates, razão social, nome fantasia, company logo, or needs to enrich, validate, or batch-query Brazilian business records. Provides 8 endpoints covering single CNPJ lookup, bulk lookup (up to 20), Simples Nacional, partner profiles, city stats, CNAE stats, logos, and plan usage. Accepts ReceitaWS and CNPJa response formats for drop-in migration. Auth via api-token header or apiToken query param. Base URL https://api.cnpj-api.com.br/v1. Rate limits free 5/min, basic 10/min, pro 90/min. Covers Brazil tax ID, federal revenue, company registry, supplier validation, KYC, KYB.
license: MIT
metadata:
  version: "0.1.0"
  homepage: https://cnpj-api.com/docs/ai/skills
  repository: https://github.com/cnpj-api/skills
---

# cnpj-api

Query Brazilian company data from the [cnpj-api.com](https://cnpj-api.com) REST API. CNPJ records, Simples Nacional status, sócios (partners), CNAE industry aggregates, IBGE city aggregates, and company logos. Data is sourced from Brazil's Receita Federal (Federal Revenue).

## When to use this skill

Use this skill whenever the user mentions any of:

- A **CNPJ** number (14 digits, Brazilian tax ID for companies)
- **Consulting, looking up, or validating** a Brazilian company / supplier / vendor
- **Simples Nacional**, MEI, ME, EPP, or SIMEI status
- **Sócios**, partners, shareholders, quadro societário
- **CNAE** (industry / activity classification)
- **Razão social**, nome fantasia, capital social, endereço
- Migration from **ReceitaWS** or **CNPJa** to a new provider
- **Supplier validation, KYB/KYC, lead enrichment** for Brazilian companies

Trigger phrases (EN): "look up CNPJ", "check this Brazilian company", "validate supplier", "enrich these CNPJs".
Trigger phrases (pt-BR): "consulte o CNPJ", "busque esta empresa", "qual a razão social", "dados do sócio", "Simples Nacional".

## Authentication

All endpoints under `/v1` require a token. Get one at [cnpj-api.com](https://cnpj-api.com).

**Preferred: HTTP header**

```
api-token: YOUR_TOKEN
```

**Alternatives** (in precedence order): `Authorization: Bearer YOUR_TOKEN` header, `?apiToken=YOUR_TOKEN` query, `?token=YOUR_TOKEN` query (legacy).

**Environment variable convention**: read the token from `CNPJ_API_TOKEN`. Never hardcode.

See [references/authentication.md](references/authentication.md) for details.

## Base URL

```
https://api.cnpj-api.com.br/v1
```

All endpoints are `/v1/*`. Health checks (`/health/live`, `/health/ready`) are public. Do not send a token.

## Endpoints

| Method | Path | Plan | Purpose |
|---|---|---|---|
| GET | `/v1/cnpj/{cnpj}` | free+ | Company profile. Address, activities, partners, status |
| POST | `/v1/bulk-cnpj` | **pro** | Batch lookup (≤20 CNPJs per call) |
| GET | `/v1/simples/{cnpj}` | free+ | Simples Nacional + SIMEI enrollment status |
| GET | `/v1/socios/{pessoaId}` | free+ | Partner profile + every company they're part of |
| GET | `/v1/cidades/{id}` | free+ | IBGE city aggregates. Top companies by capital, recent registrations |
| GET | `/v1/cnae/{cnae}` | free+ | CNAE industry aggregates |
| GET | `/v1/logos/{cnpj}` | n/a | **501 deprecated.** Use `logo_url` field on `/cnpj/{cnpj}` response instead. |
| GET | `/v1/usage` | free+ | Current plan tier + rate limit (not rate-limited itself) |

Full per-endpoint reference with all params, response schemas, and examples: [references/endpoints.md](references/endpoints.md).

## Rate limits

| Plan | Requests / minute |
|---|---|
| free | 5 |
| basic | 10 |
| pro | 90 |

On 429 responses, respect the `Retry-After` header and back off. Bulk (`/bulk-cnpj`) requires the `pro` plan.

## Quick recipes

### 1. Look up a single CNPJ

```bash
curl "https://api.cnpj-api.com.br/v1/cnpj/82845322000104" \
  -H "api-token: $CNPJ_API_TOKEN"
```

```js
const res = await fetch(
  'https://api.cnpj-api.com.br/v1/cnpj/82845322000104',
  { headers: { 'api-token': process.env.CNPJ_API_TOKEN } }
)
const data = await res.json()
```

```python
import os, requests
r = requests.get(
    'https://api.cnpj-api.com.br/v1/cnpj/82845322000104',
    headers={'api-token': os.environ['CNPJ_API_TOKEN']},
)
data = r.json()
```

Returned fields include `razao_social`, `nome_fantasia`, `situacao`, `endereco`, `empresa`, `atividade_principal`, `atividades_secundarias[]`, `logo_url`, and more.

### 2. Check Simples Nacional status

```bash
curl "https://api.cnpj-api.com.br/v1/simples/82845322000104" \
  -H "api-token: $CNPJ_API_TOKEN"
```

Returns `{ simples: { optante, data_opcao, data_exclusao }, simei: { ... } }`.

### 3. Bulk-enrich a list (Pro plan)

Chunk input to 20 CNPJs per request, respect `Retry-After` on 429.

```bash
curl -X POST "https://api.cnpj-api.com.br/v1/bulk-cnpj" \
  -H "api-token: $CNPJ_API_TOKEN" \
  -H "content-type: application/json" \
  -d '{"cnpjs":["82845322000104","60316817000103"]}'
```

For >20 CNPJs, use the included helper: `scripts/bulk-lookup.ts` (see below).

### 4. City aggregates

```bash
curl "https://api.cnpj-api.com.br/v1/cidades/3550308" \
  -H "api-token: $CNPJ_API_TOKEN"
```

The `id` is the IBGE município code (7 digits, e.g. São Paulo = 3550308).

### 5. Check the user's current plan

```bash
curl "https://api.cnpj-api.com.br/v1/usage" \
  -H "api-token: $CNPJ_API_TOKEN"
```

Returns `{ plan, rate_limit: { limit, window } }`. **Not rate-limited**. Safe to call before a batch job.

## Response format compatibility

For drop-in migration from **ReceitaWS** or **CNPJa**, append `?formato=receitaws` or `?formato=cnpja` to `/v1/cnpj/{cnpj}`:

```bash
curl "https://api.cnpj-api.com.br/v1/cnpj/82845322000104?formato=receitaws" \
  -H "api-token: $CNPJ_API_TOKEN"
```

The response matches the upstream provider's shape. See [references/compatibility.md](references/compatibility.md).

## Error handling

All errors use this envelope:

```json
{
  "error": "human-readable message",
  "reason": "TOKEN_MISSING | TOKEN_NOT_FOUND | TOKEN_REVOKED | TOKEN_EXPIRED | ...",
  "token": "masked-token",
  "requestId": "uuid",
  "date": "ISO-8601"
}
```

Common status codes:

- `400`. CNPJ format invalid (not 14 digits)
- `401`. Token missing / not found / revoked / expired
- `403`. Plan does not allow this endpoint (e.g. bulk on free)
- `404`. CNPJ or resource not found
- `429`. Rate limit exceeded; check `Retry-After` header
- `501`. Endpoint not implemented (only `/logos/{cnpj}`)

Full matrix and retry strategy: [references/errors.md](references/errors.md).

## CNPJ formatting

CNPJs must be **14 digits** in URLs. Strip punctuation from user input:

```js
const clean = (cnpj) => String(cnpj).replace(/\D/g, '')
```

Check-digit validation: use the included helper `scripts/validate-cnpj.ts`. Details and the mod-11 algorithm in [references/cnpj-format.md](references/cnpj-format.md).

## Bundled scripts

- [`scripts/validate-cnpj.ts`](scripts/validate-cnpj.ts). Check-digit validator. Reads a CNPJ from argv or stdin, prints `{ valid: boolean, cnpj: "14-digit" }` as JSON.
- [`scripts/bulk-lookup.ts`](scripts/bulk-lookup.ts). Reads CNPJs from stdin (one per line), calls `/bulk-cnpj` in chunks of 20, honors `Retry-After`, prints NDJSON results.

Both scripts require `CNPJ_API_TOKEN` in the environment.

## Reference documents

- [references/endpoints.md](references/endpoints.md). Full per-endpoint schema, parameters, and examples
- [references/authentication.md](references/authentication.md). Tokens, headers, env vars
- [references/errors.md](references/errors.md). Error envelope, HTTP codes, retry strategy
- [references/compatibility.md](references/compatibility.md). ReceitaWS / CNPJa response formats
- [references/cnpj-format.md](references/cnpj-format.md). 14-digit cleaning, check-digit algorithm, alphanumeric variant
- [references/recipes.md](references/recipes.md). Longer multi-step workflows
