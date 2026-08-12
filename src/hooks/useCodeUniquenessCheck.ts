// src/hooks/useCodeUniquenessCheck.ts
//
// Shared on-blur duplicate-code check for any master's Code field. Wire
// the returned onCodeBlur into the Code TextField's onBlur alongside
// react-hook-form's own field.onBlur:
//
//   <TextField
//     {...field}
//     onBlur={(e) => { field.onBlur(); onCodeBlur(e.target.value); }}
//   />
//
// This is purely an early-warning UX check — the authoritative,
// race-safe uniqueness check still happens server-side at submit time
// (each master's own _assert_unique_code()/_assert_unique_*_code()).
// A duplicate found here writes into the same react-hook-form error slot
// a submit-time 409 would, so both paths render identically.
import { useRef, useState } from "react";
import type { FieldValues, Path, UseFormClearErrors, UseFormSetError } from "react-hook-form";
import axios from "axios";
import { checkCodeExists } from "../services/codeCheck.service";

interface UseCodeUniquenessCheckOptions<T extends FieldValues> {
  /** MODEL_REGISTRY key on the backend, e.g. "city_master", "location". */
  entity: string;
  /** The form field the duplicate error should attach to (usually "code"). */
  fieldName: Path<T>;
  /** Extra scoping value for composite-uniqueness entities (e.g. State/Province's
   *  code is unique per-Country, not globally) — pass the selected Country code.
   *  Omit for masters with plain single-field uniqueness. */
  extraScopeValue?: string | null;
  /** The record's own uuid in Edit forms, so a form doesn't flag its own
   *  unchanged code as a duplicate of itself. Omit in Create forms. */
  excludeUuid?: string;
  setError: UseFormSetError<T>;
  clearErrors: UseFormClearErrors<T>;
  message?: string;
}

export function useCodeUniquenessCheck<T extends FieldValues>({
  entity,
  fieldName,
  extraScopeValue,
  excludeUuid,
  setError,
  clearErrors,
  message,
}: UseCodeUniquenessCheckOptions<T>) {
  const [checking, setChecking] = useState(false);
  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  async function onCodeBlur(code: string) {
    const trimmed = code?.trim();
    if (!trimmed) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const requestId = ++requestIdRef.current;
    setChecking(true);

    try {
      const exists = await checkCodeExists(
        {
          entity,
          code: trimmed,
          extra_scope_value: extraScopeValue ?? undefined,
          exclude_uuid: excludeUuid,
        },
        controller.signal,
      );

      if (requestId !== requestIdRef.current) return; // a newer blur superseded this one

      if (exists) {
        setError(fieldName, { type: "manual", message: message ?? "This code already exists." });
      } else {
        clearErrors(fieldName);
      }
    } catch (err) {
      if (!axios.isCancel(err)) throw err;
    } finally {
      if (requestId === requestIdRef.current) setChecking(false);
    }
  }

  return { onCodeBlur, checking };
}
