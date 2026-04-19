# Endpoints reference

All endpoints are under the base URL:

```
https://api.cnpj-api.com.br/v1
```

All require a token (see `authentication.md`) except `/health/live` and `/health/ready`.

---

## `GET /v1/cnpj/{cnpj}`

Retrieve full company profile.

**Path params**
- `cnpj`. 14 digits, no punctuation.

**Query params**
- `formato` *(optional)*. `receitaws` | `cnpja` | (omit for native DTO)
- `apiToken` *(optional)*. Alternative to header auth
- `token` *(optional, legacy)*. Alternative to header auth

**Response 200** (native DTO. Partial; full schema in `../assets/openapi.json`):

```jsonc
{
  "cnpj": "82845322000104",
  "razao_social": "WEG EQUIPAMENTOS ELETRICOS SA",
  "nome_fantasia": "WEG",
  "data_abertura": "1961-09-16",
  "matriz": true,
  "atualizado_em": "2026-04-01T00:00:00Z",
  "logo_url": "https://cdn.cnpj-api.com/logos/82845322000104.png",
  "icone": "https://cdn.cnpj-api.com/icons/82845322000104.png",
  "websites": ["weg.net"],
  "situacao": { "codigo": 2, "descricao": "ATIVA" },
  "data_situacao": "2005-11-03",
  "telefones": [{ "ddd": "47", "numero": "32764000" }],
  "emails": [{ "endereco": "contato@weg.net" }],
  "atividade_principal": { "codigo": 2710400, "descricao": "..." },
  "atividades_secundarias": [{ "codigo": 3314702, "descricao": "..." }],
  "endereco": {
    "tipo_logradouro": "AVENIDA",
    "logradouro": "PREFEITO WALDEMAR GRUBBA",
    "numero": "3300",
    "bairro": "VILA LALAU",
    "municipio_codigo": 4210001,
    "municipio": "JARAGUA DO SUL",
    "uf": "SC",
    "cep": "89256900",
    "pais": { "codigo": 1058, "nome": "BRASIL" }
  },
  "empresa": {
    "capital_social": 1500000000.00,
    "porte": { "codigo": 5, "descricao": "DEMAIS" },
    "natureza_juridica": { "codigo": 2046, "descricao": "Sociedade Anônima Aberta" }
  }
}
```

**Errors**: 400 invalid CNPJ · 401 auth · 404 not found · 429 rate-limited.

---

## `POST /v1/bulk-cnpj`

Batch lookup. **Pro plan only**.

**Body** (JSON):

```json
{ "cnpjs": ["82845322000104", "60316817000103"] }
```

- 1–20 items per call
- Each must be 14 digits

**Response 200**:

```json
[
  { "cnpj": "82845322000104", "data": { /* EstabelecimentoDto */ } },
  { "cnpj": "00000000000000", "data": null }
]
```

`data: null` means not found (no 404 for individual items).

**Errors**: 400 shape · 401 auth · 403 not on Pro · 429 rate-limited.

---

## `GET /v1/simples/{cnpj}`

Simples Nacional + SIMEI enrollment.

**Response 200**:

```json
{
  "cnpj": "82845322000104",
  "atualizado_em": "2026-04-01T00:00:00Z",
  "simples": {
    "optante": false,
    "data_opcao": null,
    "data_exclusao": null
  },
  "simei": {
    "optante": false,
    "data_opcao": null,
    "data_exclusao": null
  }
}
```

**Errors**: 400 invalid CNPJ · 401 auth · 404 not found · 429 rate-limited.

---

## `GET /v1/socios/{pessoaId}`

Partner (sócio) profile and every company they're linked to.

**Path params**
- `pessoaId`. 32-char hex hash. Obtain it from `sócios[].pessoa_id` on a `/cnpj/{cnpj}` response.

**Response 200**:

```json
{
  "pessoa": {
    "id": "...",
    "tipo": "PESSOA_FISICA | PESSOA_JURIDICA | ESTRANGEIRO | DESCONHECIDO",
    "nome": "...",
    "cpf_cnpj": "***.***.***-**",
    "faixa_etaria": "30-39",
    "pais_origem": { "codigo": 1058, "nome": "BRASIL" }
  },
  "participacoes": [
    {
      "cnpj": "...",
      "razao_social": "...",
      "nome_fantasia": "...",
      "capital_social": 50000.00,
      "data_entrada": "2020-01-15",
      "qualificacao": { "codigo": 10, "descricao": "Sócio-Gerente" },
      "situacao": { "codigo": 2, "descricao": "Ativa" }
    }
  ]
}
```

**Errors**: 400 malformed hex · 401 auth · 404 not found · 429 rate-limited.

---

## `GET /v1/cidades/{id}`

City-level aggregates by IBGE município code (7 digits; e.g. São Paulo = `3550308`).

**Response 200**:

```json
{
  "municipio_codigo": 3550308,
  "nome": "São Paulo",
  "capital_social_total": 125000000000.00,
  "empresas_maior_capital": [ /* CompanyRefDto[] */ ],
  "empresas_recentes": [ /* CompanyRefDto[] */ ],
  "socios_maior_capital": [ /* PartnerRefDto[] */ ]
}
```

---

## `GET /v1/cnae/{cnae}`

Aggregates by CNAE activity code (5–7 digits; e.g. `6202300` for custom software development).

**Response 200**:

```json
{
  "codigo": 6202300,
  "descricao": "Desenvolvimento e licenciamento de programas de computador customizáveis",
  "capital_social_total": 500000000.00,
  "empresas_maior_capital": [ /* CompanyRefDto[] */ ],
  "empresas_recentes": [ /* CompanyRefDto[] */ ]
}
```

---

## `GET /v1/logos/{cnpj}`. **DEPRECATED**

Returns `501 Not Implemented`. **Do not call this endpoint.** Instead, use the `logo_url` and `icone` fields returned by `GET /v1/cnpj/{cnpj}`.

---

## `GET /v1/usage`

Current token's plan and rate limit. **Not rate-limited**. Safe to call before batch jobs.

**Response 200**:

```json
{
  "plan": "pro",
  "rate_limit": { "limit": 90, "window": "1 minute" }
}
```

Plans that appear: `free`, `basic`, `pro`. Custom per-token `limit` may override plan defaults.
