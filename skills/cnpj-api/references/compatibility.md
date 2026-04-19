# Response format compatibility

`cnpj-api` can mirror the response shape of two popular providers for drop-in migration. Use the `formato` query param on `/v1/cnpj/{cnpj}`.

## ReceitaWS format

```bash
curl "https://api.cnpj-api.com.br/v1/cnpj/82845322000104?formato=receitaws" \
  -H "api-token: $CNPJ_API_TOKEN"
```

The response matches the documented [ReceitaWS](https://receitaws.com.br) shape — same field names, same nesting. Swap the URL and token, no other code changes.

## CNPJa format

```bash
curl "https://api.cnpj-api.com.br/v1/cnpj/82845322000104?formato=cnpja" \
  -H "api-token: $CNPJ_API_TOKEN"
```

Matches [cnpja.com](https://cnpja.com)'s response shape.

## Native format

Omit `formato` (or pass `default`) for the native DTO. This is the richest shape and the only one that includes:

- `logo_url` and `icone` (CDN URLs for brand assets)
- `websites[]`
- `faixa_etaria` on partners
- `municipio_codigo` (IBGE)

Use native for new integrations. Use `receitaws` / `cnpja` only to migrate existing code without touching response parsing.

## Migration checklist

1. Swap base URL to `https://api.cnpj-api.com.br/v1`.
2. Swap token (get one at cnpj-api.com).
3. Append `?formato=receitaws` or `?formato=cnpja` depending on your previous provider.
4. Verify a few canonical CNPJs — the shape should match.
5. Update rate-limit handling if you were on a stricter plan before.
