import {
  InputAdornment,
  TextField,
  IconButton,
  type TextFieldProps,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchInputProps extends TextFieldProps {
  value?: string;
  onSearch?: () => void;
  onClear?: () => void;
}

export function SearchInput({
  value,
  onSearch,
  onClear,
  ...props
}: SearchInputProps) {
  const hasValue = Boolean(value?.trim());

  return (
    <TextField
      fullWidth
      {...props}
      value={value}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSearch?.();
        }
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton
              size="small"
              onClick={hasValue ? onClear : onSearch}
              edge="start"
            >
              {hasValue ? (
                <CloseIcon fontSize="small" />
              ) : (
                <SearchIcon color="action" />
              )}
            </IconButton>
          </InputAdornment>
        ),
        ...props.InputProps,
      }}
    />
  );
}
