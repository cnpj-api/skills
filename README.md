# cnpj-api / skills

**[🇧🇷 Português](#-português)** · **[🇺🇸 English](#-english)**

Agent Skill oficial da [cnpj-api.com](https://cnpj-api.com) para consultar dados de empresas brasileiras. CNPJ, Simples Nacional, sócios, CNAE, IBGE e mais. Direto do seu agente de IA (Claude Code, Cursor, Codex, Windsurf, OpenCode e +40 outros).

```bash
npx skills add cnpj-api/skills
```

---

## 🇧🇷 Português

Agent Skills são pacotes de conhecimento que agentes de IA carregam sob demanda. Este pacote ensina seu agente a consultar dados da Receita Federal sem precisar ler documentação. Autenticação, endpoints, tratamento de erros e formatação de CNPJ já vêm configurados.

### Instalação

```bash
npx skills add cnpj-api/skills
```

O CLI coloca os arquivos no diretório correto do seu agente (`.claude/skills/`, `.cursor/skills/`, etc.).

### Instalação manual

```bash
git clone https://github.com/cnpj-api/skills
cp -r skills/cnpj-api .claude/skills/
```

### Configuração

1. Crie uma conta grátis em [cnpj-api.com](https://cnpj-api.com)
2. Gere um token no painel
3. Exporte como variável de ambiente:

```bash
export CNPJ_API_TOKEN="seu-token-aqui"
```

### O que está incluído

Uma skill (`cnpj-api`) cobrindo 8 endpoints:

| Endpoint | Plano | Descrição |
|---|---|---|
| `GET /v1/cnpj/{cnpj}` | free+ | Dados completos da empresa (razão social, endereço, atividades, sócios) |
| `POST /v1/bulk-cnpj` | **pro** | Consulta em lote (até 20 CNPJs por chamada) |
| `GET /v1/simples/{cnpj}` | free+ | Status do Simples Nacional e SIMEI |
| `GET /v1/socios/{pessoaId}` | free+ | Perfil do sócio + todas as empresas vinculadas |
| `GET /v1/cidades/{id}` | free+ | Agregados por município (código IBGE) |
| `GET /v1/cnae/{cnae}` | free+ | Agregados por classificação de atividade |
| `GET /v1/usage` | free+ | Plano atual e rate limit |

Mais scripts auxiliares:

- `validate-cnpj.ts`. Validação dos dígitos verificadores (mod-11)
- `bulk-lookup.ts`. Enriquecimento em lote com tratamento automático de rate limit

### Limites por plano

Veja planos e preços em [cnpj-api.com/precos](https://cnpj-api.com/precos). Consulta em lote (`/bulk-cnpj`) requer o plano **Pro**.

### Compatibilidade

A skill aceita os formatos de resposta do **ReceitaWS** e do **CNPJa** via parâmetro `?formato=receitaws` ou `?formato=cnpja`. Migração sem mudar código.

### Exemplos de uso

Depois de instalar, basta pedir ao seu agente em português natural:

- *"Consulte o CNPJ 82.845.322/0001-04"*
- *"Essa empresa é Simples Nacional?"*
- *"Me dá os sócios dessa empresa"*
- *"Enriquece essa lista de 50 CNPJs"*
- *"Quais as maiores empresas de São Paulo?"*

O agente vai escolher o endpoint correto, tratar erros e respeitar o rate limit automaticamente.

### Documentação

- Docs da skill: [cnpj-api.com/docs/ai/skills](https://cnpj-api.com/docs/ai/skills)
- Referência da API: [docs.cnpj-api.com](https://docs.cnpj-api.com)
- Especificação Agent Skills: [agentskills.io](https://agentskills.io)

### Agentes compatíveis

Claude Code, Cursor, Codex, Windsurf, OpenCode, Amp, Antigravity, Cline, Gemini CLI, Goose, Firebender, Kiro, Roo Code, VS Code Copilot, e +30 outros. Ver [lista completa](https://agentskills.io/home).

### Licença

[MIT](./LICENSE)

### Contribuindo

Issues e PRs são bem-vindos. Se adicionar uma nova receita ou referência de endpoint, mantenha o `SKILL.md` abaixo de 500 linhas e coloque detalhes em `references/`.

---

## 🇺🇸 English

Official [cnpj-api.com](https://cnpj-api.com) Agent Skill for querying Brazilian company data. CNPJs, Simples Nacional, partners (sócios), CNAE industry classification, IBGE city aggregates and more. Directly from your AI coding agent (Claude Code, Cursor, Codex, Windsurf, OpenCode, and 40+ others).

### Install

```bash
npx skills add cnpj-api/skills
```

The CLI places the skill files in the right directory for your agent (`.claude/skills/`, `.cursor/skills/`, etc.).

### Manual install

```bash
git clone https://github.com/cnpj-api/skills
cp -r skills/cnpj-api .claude/skills/
```

### Setup

1. Create a free account at [cnpj-api.com](https://cnpj-api.com)
2. Generate a token from your dashboard
3. Export as an environment variable:

```bash
export CNPJ_API_TOKEN="your-token-here"
```

### What's included

A single skill (`cnpj-api`) covering 8 endpoints:

| Endpoint | Plan | Description |
|---|---|---|
| `GET /v1/cnpj/{cnpj}` | free+ | Full company profile (legal name, address, activities, partners) |
| `POST /v1/bulk-cnpj` | **pro** | Batch lookup (up to 20 CNPJs per call) |
| `GET /v1/simples/{cnpj}` | free+ | Simples Nacional and SIMEI status |
| `GET /v1/socios/{pessoaId}` | free+ | Partner profile + every linked company |
| `GET /v1/cidades/{id}` | free+ | IBGE city aggregates |
| `GET /v1/cnae/{cnae}` | free+ | Industry classification aggregates |
| `GET /v1/usage` | free+ | Current plan and rate limit |

Plus bundled helper scripts:

- `validate-cnpj.ts`. Check-digit validation (mod-11)
- `bulk-lookup.ts`. Chunked batch enrichment with automatic rate-limit backoff

### Plan limits

See plans and pricing at [cnpj-api.com/precos](https://cnpj-api.com/precos). Batch endpoint (`/bulk-cnpj`) requires the **Pro** plan.

### Compatibility

The skill accepts **ReceitaWS** and **CNPJa** response formats via `?formato=receitaws` or `?formato=cnpja`. Drop-in migration without changing parsing code.

### Usage examples

After install, ask your agent in natural English:

- *"Look up CNPJ 82.845.322/0001-04"*
- *"Is this company registered in Simples Nacional?"*
- *"Who are the partners of this company?"*
- *"Enrich this list of 50 CNPJs"*
- *"What are the largest companies in São Paulo?"*

The agent picks the right endpoint, handles errors, and respects the rate limit automatically.

### Documentation

- Skill docs: [cnpj-api.com/docs/ai/skills](https://cnpj-api.com/docs/ai/skills)
- API reference: [docs.cnpj-api.com](https://docs.cnpj-api.com)
- Agent Skills spec: [agentskills.io](https://agentskills.io)

### Compatible agents

Claude Code, Cursor, Codex, Windsurf, OpenCode, Amp, Antigravity, Cline, Gemini CLI, Goose, Firebender, Kiro, Roo Code, VS Code Copilot, and 30+ more. See the [full list](https://agentskills.io/home).

### License

[MIT](./LICENSE)

### Contributing

Issues and PRs welcome. If you add a new recipe or endpoint reference, keep `SKILL.md` under 500 lines and push detail into `references/`.
