// src/utils/nullsToEmpty.ts

/**
 * API responses return `null` for unset optional fields, but Zod's `.optional()`
 * only accepts `undefined` — feeding a `null` into react-hook-form's `reset()`/
 * `defaultValues` makes that field fail validation with no visible error (unless
 * it happens to render error/helperText). `{...emptyValues, ...apiValues}` lets
 * a `null` from the API clobber the correct empty representation already encoded
 * in `emptyValues` (`""` for strings, `null` for nullable numbers, etc).
 *
 * This merges instead: any key where `apiValues` is `null`/`undefined` keeps
 * whatever `emptyValues` already defines for it, so each field's own "empty"
 * shape is preserved rather than being blindly overwritten or stringified.
 */
export function mergeFormDefaults<T extends object>(
  emptyValues: T,
  apiValues?: Partial<T> | null,
): T {
  const result = { ...emptyValues };
  if (!apiValues) return result;
  for (const key of Object.keys(apiValues) as (keyof T)[]) {
    const value = apiValues[key];
    if (value !== null && value !== undefined) {
      result[key] = value as T[keyof T];
    }
  }
  return result;
}
