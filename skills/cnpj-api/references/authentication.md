# Authentication

## Getting a token

1. Sign up at [cnpj-api.com](https://cnpj-api.com) (free plan, no credit card).
2. Generate a token from your dashboard.
3. Store it in the environment as `CNPJ_API_TOKEN`. Never hardcode it.

## Passing the token

Four options, in order of preference:

### 1. `api-token` header (preferred)

```bash
curl "https://api.cnpj-api.com.br/v1/cnpj/82845322000104" \
  -H "api-token: $CNPJ_API_TOKEN"
```

### 2. `Authorization: Bearer` header

```bash
curl "https://api.cnpj-api.com.br/v1/cnpj/82845322000104" \
  -H "Authorization: Bearer $CNPJ_API_TOKEN"
```

### 3. `apiToken` query param

```
https://api.cnpj-api.com.br/v1/cnpj/82845322000104?apiToken=TOKEN
```

Use only for quick demos. Query strings leak into logs, referrers, and browser history.

### 4. `token` query param (legacy)

Preserved for compatibility. Prefer `apiToken`.

## Token errors

All 401 responses include a `reason` field:

| `reason` | Meaning |
|---|---|
| `TOKEN_MISSING` | No token in header or query |
| `TOKEN_NOT_FOUND` | Token doesn't exist in the store |
| `TOKEN_REVOKED` | Token was revoked by the account owner |
| `TOKEN_EXPIRED` | Token has an expiry and it's past |

## Environment variable convention

All scripts and examples read `CNPJ_API_TOKEN`. Agents writing code for the user should:

- Never write the token into source files
- Never echo the token into logs
- Use `.env` files and add them to `.gitignore`
