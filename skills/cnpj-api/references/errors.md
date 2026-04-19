# Errors

## Envelope

All errors return this shape:

```json
{
  "error": "human-readable message",
  "reason": "MACHINE_READABLE_CODE",
  "token": "masked-token-or-null",
  "requestId": "uuid-v4",
  "date": "2026-04-18T12:34:56.000Z"
}
```

Log `requestId` when reporting issues.

## Status code matrix

| Code | Meaning | Typical `reason` | Retry? |
|---|---|---|---|
| 400 | Bad request | `INVALID_CNPJ`, `INVALID_BODY` | No. Fix input |
| 401 | Unauthenticated | `TOKEN_MISSING`, `TOKEN_NOT_FOUND`, `TOKEN_REVOKED`, `TOKEN_EXPIRED` | No. Rotate token |
| 403 | Forbidden | `PLAN_REQUIRED` | No. Upgrade plan |
| 404 | Not found | `CNPJ_NOT_FOUND`, `PESSOA_NOT_FOUND`, `CIDADE_NOT_FOUND`, `CNAE_NOT_FOUND` | No |
| 429 | Rate limited | `RATE_LIMIT_EXCEEDED` | **Yes**. See below |
| 501 | Not implemented | (none) | No. Only `/logos/{cnpj}` |

## Handling 429

Respect the `Retry-After` response header (seconds or HTTP date). Back off exponentially if no header is present:

```js
async function call(url, opts, attempt = 0) {
  const res = await fetch(url, opts)
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('retry-after')) || Math.min(60, 2 ** attempt)
    if (attempt >= 5) throw new Error('Max retries')
    await new Promise(r => setTimeout(r, retryAfter * 1000))
    return call(url, opts, attempt + 1)
  }
  return res
}
```

Rate limits per plan:

- `free`. 5 req/min
- `basic`. 10 req/min
- `pro`. 90 req/min

`/v1/usage` is not rate-limited. Call it first if uncertain about the current plan.

## Handling 401

Don't retry. The token is bad. Ask the user to rotate it from the dashboard.

## Handling 403

Don't retry. The endpoint requires a higher plan. For `/bulk-cnpj`, upgrade to Pro.
