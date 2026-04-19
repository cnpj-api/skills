#!/usr/bin/env node
/**
 * bulk-lookup.ts
 *
 * Reads CNPJs from stdin (one per line), calls POST /v1/bulk-cnpj in chunks of 20,
 * honors Retry-After on 429, and prints NDJSON (one JSON object per line) to stdout.
 *
 * Requires: CNPJ_API_TOKEN env var. Requires Pro plan (bulk endpoint is Pro-only).
 *
 * Usage:
 *   cat cnpjs.txt | node bulk-lookup.ts
 *   node bulk-lookup.ts < cnpjs.txt
 */

const BASE_URL = 'https://api.cnpj-api.com.br/v1'
const CHUNK_SIZE = 20
const MAX_RETRIES = 5

function clean(raw: string): string {
  return String(raw).replace(/\D/g, '')
}

async function readStdinLines(): Promise<string[]> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks)
    .toString('utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function callBulk(
  token: string,
  cnpjs: string[],
  attempt = 0,
): Promise<Array<{ cnpj: string; data: unknown }>> {
  const res = await fetch(`${BASE_URL}/bulk-cnpj`, {
    method: 'POST',
    headers: {
      'api-token': token,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ cnpjs }),
  })

  if (res.status === 429) {
    if (attempt >= MAX_RETRIES) throw new Error('Max retries exceeded on 429')
    const retryAfterRaw = res.headers.get('retry-after')
    const retryAfterSec = retryAfterRaw ? Number(retryAfterRaw) : Math.min(60, 2 ** attempt)
    process.stderr.write(`[bulk-lookup] 429 — waiting ${retryAfterSec}s (attempt ${attempt + 1})\n`)
    await sleep((Number.isFinite(retryAfterSec) ? retryAfterSec : 5) * 1000)
    return callBulk(token, cnpjs, attempt + 1)
  }

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Bulk call failed: ${res.status} ${body}`)
  }

  return (await res.json()) as Array<{ cnpj: string; data: unknown }>
}

async function main(): Promise<void> {
  const token = process.env.CNPJ_API_TOKEN
  if (!token) {
    process.stderr.write('Missing CNPJ_API_TOKEN env var\n')
    process.exit(2)
  }

  const raw = await readStdinLines()
  const cnpjs = Array.from(new Set(raw.map(clean).filter((c) => c.length === 14)))
  if (cnpjs.length === 0) {
    process.stderr.write('No valid 14-digit CNPJs on stdin\n')
    process.exit(2)
  }

  process.stderr.write(`[bulk-lookup] processing ${cnpjs.length} CNPJs in chunks of ${CHUNK_SIZE}\n`)

  for (let i = 0; i < cnpjs.length; i += CHUNK_SIZE) {
    const chunk = cnpjs.slice(i, i + CHUNK_SIZE)
    const results = await callBulk(token, chunk)
    for (const row of results) {
      process.stdout.write(JSON.stringify(row) + '\n')
    }
  }
}

main().catch((err) => {
  process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`)
  process.exit(1)
})
