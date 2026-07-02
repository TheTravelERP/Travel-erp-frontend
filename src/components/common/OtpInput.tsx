// src/components/common/OtpInput.tsx
import React, { forwardRef, useImperativeHandle, useRef } from "react";

import { Box, TextField } from "@mui/material";

export interface OtpInputHandle {
  clear: () => void;
  focus: () => void;
}

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(
  ({ value, onChange, length = 6, disabled = false }, ref) => {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const digits = Array.from({ length }, (_, index) => value[index] || "");

    useImperativeHandle(ref, () => ({
      clear() {
        onChange("");
      },

      focus() {
        inputRefs.current[0]?.focus();
      },
    }));

    const updateDigit = (digit: string, index: number) => {
      if (!/^\d?$/.test(digit)) return;

      const updated = [...digits];

      updated[index] = digit;

      onChange(updated.join(""));

      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      index: number,
    ) => {
      switch (e.key) {
        case "Backspace":
          if (!digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
          }
          break;

        case "ArrowLeft":
          if (index > 0) {
            inputRefs.current[index - 1]?.focus();
          }
          break;

        case "ArrowRight":
          if (index < length - 1) {
            inputRefs.current[index + 1]?.focus();
          }
          break;
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length);

      if (!pasted) return;

      onChange(pasted);

      const focusIndex = Math.min(pasted.length, length) - 1;

      setTimeout(() => {
        inputRefs.current[focusIndex]?.focus();
      }, 0);
    };

    return (
      <Box display="flex" justifyContent="center" gap={1}>
        {digits.map((digit, index) => (
          <TextField
            key={index}
            value={digit}
            disabled={disabled}
            inputRef={(el) => {
              inputRefs.current[index] = el;
            }}
            onChange={(e) => updateDigit(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            inputProps={{
             "aria-label": `OTP Digit ${index + 1}`,
              maxLength: 1,
              inputMode: "numeric",
              style: {
                textAlign: "center",
                fontSize: 22,
                fontWeight: 600,
              },
            }}
            sx={{
              width: 56,
            }}
          />
        ))}
      </Box>
    );
  },
);

OtpInput.displayName = "OtpInput";

export default OtpInput;
