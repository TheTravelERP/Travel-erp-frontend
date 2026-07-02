// src/components/common/PasswordField.tsx

import React from "react";
import {
  TextField,
  type TextFieldProps,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type PasswordFieldProps = Omit<TextFieldProps, "type">;

export default function PasswordField(props: PasswordFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <TextField
      {...props}
      type={showPassword ? "text" : "password"}
      InputProps={{
        ...props.InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              edge="end"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
