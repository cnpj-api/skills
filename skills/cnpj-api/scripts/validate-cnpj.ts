#!/usr/bin/env node
/**
 * validate-cnpj.ts
 *
 * Validates a Brazilian CNPJ using the mod-11 check-digit algorithm.
 * Accepts input from argv[2] or stdin.
 *
 * Output: single line of JSON. { valid: boolean, cnpj: "14-digit" | null, reason?: string }
 *
 * Usage:
 *   node validate-cnpj.ts 82.845.322/0001-04
 *   echo "82845322000104" | node validate-cnpj.ts
 */

function clean(raw: string): string {
  return String(raw).replace(/\D/g, '')
}

function mod11Digit(digits: string, weights: number[]): number {
  let sum = 0
  for (let i = 0; i < weights.length; i++) {
    sum += Number(digits[i]) * weights[i]
  }
  const rem = sum % 11
  return rem < 2 ? 0 : 11 - rem
}

export function validateCnpj(input: string): { valid: boolean; cnpj: string | null; reason?: string } {
  const cnpj = clean(input)
  if (cnpj.length !== 14) {
    return { valid: false, cnpj: null, reason: 'LENGTH_NOT_14' }
  }
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return { valid: false, cnpj, reason: 'ALL_SAME_DIGIT' }
  }
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const d1 = mod11Digit(cnpj.slice(0, 12), w1)
  const d2 = mod11Digit(cnpj.slice(0, 12) + String(d1), w2)
  const ok = d1 === Number(cnpj[12]) && d2 === Number(cnpj[13])
  return ok ? { valid: true, cnpj } : { valid: false, cnpj, reason: 'CHECK_DIGIT_MISMATCH' }
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
