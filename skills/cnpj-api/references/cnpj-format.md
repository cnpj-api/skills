# CNPJ format

## Structure

A CNPJ has **14 digits**, split into:

```
XX.XXX.XXX/YYYY-ZZ
└── 8 ──┘ └─4─┘ └2┘
 root     branch  check
```

- First 8 digits. Company root (identifies the legal entity)
- 4 digits. Branch / filial number (`0001` = headquarters)
- Last 2 digits. Check digits (mod-11)

## In API URLs

Always **strip punctuation** before calling the API:

```js
const clean = (cnpj) => String(cnpj).replace(/\D/g, '')
// "82.845.322/0001-04" → "82845322000104"
```

If the cleaned string isn't exactly 14 digits, the API returns `400 INVALID_CNPJ`.

## Check-digit validation

The two trailing digits are calculated from the first 12 using multiplier weights and mod-11. A CNPJ can be **well-formed but not registered**. Check digits only verify the number's structure, not whether the company exists.

Use `scripts/validate-cnpj.ts`:

```bash
echo "82845322000104" | node skills/cnpj-api/scripts/validate-cnpj.ts
# {"valid":true,"cnpj":"82845322000104"}
```

## Alphanumeric CNPJ (2026+)

Receita Federal is rolling out alphanumeric CNPJs. When encountered, convert characters to their ASCII codes minus 48 for the check-digit calculation. The API accepts both formats; pass the user-provided string as-is (after stripping punctuation and dashes, keeping letters).

For most workflows you only encounter all-digit CNPJs. Support for alphanumeric in existing databases is optional.

## Quick sanity rules

- 14 characters after stripping punctuation
- Not all the same digit (`00000000000000` and similar are invalid)
- Check digits match the mod-11 calculation
