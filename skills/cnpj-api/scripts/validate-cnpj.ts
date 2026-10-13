#!/usr/bin/env node
/**
 * validate-cnpj.ts
 *
 * Validates a Brazilian CNPJ using the mod-11 check-digit algorithm.
 * Handles both the traditional all-numeric format and the alphanumeric format
 * in force since July 2026 (positions 1-12 [A-Z0-9], 13-14 numeric check digits).
 * Accepts input from argv[2] or stdin.
 *
 * Output: single line of JSON.
 *   { valid: boolean, cnpj: "14-character" | null, type: "traditional" | "alphanumeric" | "unknown", reason?: string }
 *
 * Usage:
 *   node validate-cnpj.ts 82.845.322/0001-04
 *   echo "82845322000104" | node validate-cnpj.ts
 *   echo "00000000E08G12" | node validate-cnpj.ts
 */

type CnpjType = 'traditional' | 'alphanumeric' | 'unknown'

export interface ValidateCnpjResult {
  valid: boolean
  cnpj: string | null
  type: CnpjType
  reason?: string
}

/** Strips punctuation but keeps letters, which are significant since July 2026. */
function clean(raw: string): string {
  return String(raw)
    .replace(/[.\-/\s]/g, '')
    .toUpperCase()
}

/**
 * Character value for the mod-11 sum: digits are their face value, letters use
 * their ASCII code minus 48 (A = 17 ... Z = 42), per Receita Federal's spec.
 */
function charValue(char: string): number {
  return char.charCodeAt(0) - 48
}

function detectType(cnpj: string): CnpjType {
  if (/^\d{14}$/.test(cnpj)) return 'traditional'
  if (/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) return 'alphanumeric'
  return 'unknown'
}

function mod11Digit(chars: string, weights: number[]): number {
  let sum = 0
  for (let i = 0; i < weights.length; i++) {
    sum += charValue(chars[i]) * weights[i]
  }
  const rem = sum % 11
  return rem < 2 ? 0 : 11 - rem
}

export function validateCnpj(input: string): ValidateCnpjResult {
  const cnpj = clean(input)
  if (cnpj.length !== 14) {
    return { valid: false, cnpj: null, type: 'unknown', reason: 'LENGTH_NOT_14' }
  }
  const type = detectType(cnpj)
  if (type === 'unknown') {
    // Either an illegal character, or letters in the check-digit positions.
    return { valid: false, cnpj, type, reason: 'INVALID_CHARACTERS' }
  }
  // Repeated characters are only a known filler pattern for traditional CNPJs.
  if (type === 'traditional' && /^(\d)\1{13}$/.test(cnpj)) {
    return { valid: false, cnpj, type, reason: 'ALL_SAME_DIGIT' }
  }
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const d1 = mod11Digit(cnpj.slice(0, 12), w1)
  const d2 = mod11Digit(cnpj.slice(0, 12) + String(d1), w2)
  const ok = d1 === Number(cnpj[12]) && d2 === Number(cnpj[13])
  return ok ? { valid: true, cnpj, type } : { valid: false, cnpj, type, reason: 'CHECK_DIGIT_MISMATCH' }
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => (data += chunk))
    process.stdin.on('end', () => resolve(data.trim()))
  })
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2).join(' ').trim()
  const input = argv || (await readStdin())
  if (!input) {
    process.stderr.write('Usage: validate-cnpj.ts <cnpj>  OR  echo <cnpj> | validate-cnpj.ts\n')
    process.exit(2)
  }
  const result = validateCnpj(input)
  process.stdout.write(JSON.stringify(result) + '\n')
  process.exit(result.valid ? 0 : 1)
}

// Only run when executed directly (not when imported)
const isMain =
  typeof require !== 'undefined' && typeof module !== 'undefined'
    ? require.main === module
    : import.meta.url.endsWith(process.argv[1] ?? '')

if (isMain) {
  main().catch((err) => {
    process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`)
    process.exit(2)
  })
}
