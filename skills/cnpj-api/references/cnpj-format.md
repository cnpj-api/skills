# CNPJ format

## Structure

A CNPJ has **14 characters**, split into:

```
XX.XXX.XXX/YYYY-ZZ
└── 8 ──┘ └─4─┘ └2┘
 root     branch  check
```

- First 8 characters. Company root (identifies the legal entity)
- 4 characters. Branch / filial number (`0001` = headquarters)
- Last 2 characters. Check digits (mod-11), always numeric

Positions 1-12 may be `[A-Z0-9]`; only the two check digits are guaranteed numeric.

## In API URLs

Always **strip punctuation** before calling the API, but keep the letters:

```js
const clean = (cnpj) => String(cnpj).replace(/[.\-/\s]/g, '').toUpperCase()
// "82.845.322/0001-04" → "82845322000104"
// "00.000.000/e08g-12" → "00000000E08G12"
```

`replace(/\D/g, '')` is wrong: it silently turns `00000000E08G12` into `000000000812`, a different (and unregistered) number.

If the cleaned string isn't exactly 14 characters, the API returns `400 INVALID_CNPJ`. The API uppercases for you, so lowercase input is accepted.

## Check-digit validation

The two trailing digits are calculated from the first 12 using multiplier weights and mod-11. A CNPJ can be **well-formed but not registered**. Check digits only verify the number's structure, not whether the company exists.

Use `scripts/validate-cnpj.ts`:

```bash
echo "82845322000104" | node skills/cnpj-api/scripts/validate-cnpj.ts
# {"valid":true,"cnpj":"82845322000104"}
```

## Alphanumeric CNPJ (in force since July 2026)

Positions 1-12 may contain `A-Z` as well as `0-9`; the two check digits stay numeric. For the mod-11 sum, convert each character to its ASCII code minus 48, so `0`-`9` keep their face value and `A` = 17 through `Z` = 42. The weights and the rest of the algorithm are unchanged.

Real example already in Receita's published data: `00000000E08G12`, a Banco do Brasil branch in Brasília opened 2026-07-31.

The API accepts both formats on every endpoint. Pass the user-provided string after stripping punctuation and **keeping the letters**.

These are rare today but no longer hypothetical: treat alphanumeric support as required, not optional. A digit-stripping `clean()` fails silently — it produces a well-formed 12-character string rather than an error — so audit any existing `/\D/g` in your own code.

## Quick sanity rules

- 14 characters after stripping punctuation, matching `^[A-Z0-9]{12}\d{2}$`
- Not all the same digit (`00000000000000` and similar are invalid). This only applies to traditional CNPJs
- Check digits match the mod-11 calculation
