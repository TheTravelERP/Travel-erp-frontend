import { InputAdornment, TextField, type TextFieldProps } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

// components/ui/SearchInput.tsx
export function SearchInput(props: TextFieldProps) {
  return (
    <TextField
      fullWidth
      {...props}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        ...props.InputProps,
      }}
    />
  );
}
