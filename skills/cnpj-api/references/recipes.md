# Recipes

Multi-step workflows combining several endpoints.

## 1. Supplier validation

Given a CNPJ, return a "is this supplier safe to onboard?" summary.

1. `GET /v1/cnpj/{cnpj}` — confirm `situacao.descricao === "ATIVA"`
2. `GET /v1/simples/{cnpj}` — surface MEI/ME/EPP tax regime
3. For each `socio` in step 1, optionally `GET /v1/socios/{pessoaId}` — surface other companies the partners run (KYB signal)

Output: company status + tax regime + partner exposure summary.

## 2. Lead enrichment from a CSV

Input: CSV with `cnpj` column (possibly formatted with punctuation).

1. Clean each CNPJ to 14 digits
2. `GET /v1/usage` — confirm current plan before committing to a long run
3. Chunk to 20 per call, `POST /v1/bulk-cnpj` (requires Pro)
4. Merge results back into the CSV, preserving original rows where `data === null`

Use `scripts/bulk-lookup.ts` — it handles chunking, retries, and NDJSON output.

## 3. Market sizing by industry (CNAE)

Given a CNAE code (e.g. `6202300` for custom software development):

1. `GET /v1/cnae/{cnae}` — returns `capital_social_total` across Brazil, plus top and recent companies
2. Optionally, for each returned company: `GET /v1/cnpj/{cnpj}` for full address to bucket by UF/município

Useful for sales territory planning.

## 4. Geographic concentration

Given an IBGE city code (e.g. `3550308` São Paulo):

1. `GET /v1/cidades/{id}` — returns top companies by capital and largest individual partners in the city
2. Cross-reference with industry data via `GET /v1/cnae/{cnae}` for the dominant CNAEs

## 5. ReceitaWS migration smoke test

If migrating existing code that was hitting ReceitaWS:

1. Pick 5 known CNPJs from your production logs
2. Call `/v1/cnpj/{cnpj}?formato=receitaws` for each
3. Diff the response against the ReceitaWS output you previously cached
4. If fields match, swap the base URL in your codebase and ship

Typical drift: none. ReceitaWS format is stable.
