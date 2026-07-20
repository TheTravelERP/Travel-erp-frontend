// src/features/settings/index.tsx
import { Box, Typography, Paper, Tooltip, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';
import { useAppTheme } from '../../context/ThemeContext';
import { useSnackbar } from '../../components/ui/SnackbarProvider';

const COLOR_SWATCHES: { label: string; value: string }[] = [
  { label: 'Green', value: '#30a435' },
  { label: 'Red', value: '#d32f2f' },
  { label: 'Pink', value: '#c2185b' },
  { label: 'Purple', value: '#7b1fa2' },
  { label: 'Deep Purple', value: '#512da8' },
  { label: 'Indigo', value: '#303f9f' },
  { label: 'Blue', value: '#1976d2' },
  { label: 'Light Blue', value: '#0288d1' },
  { label: 'Cyan', value: '#0097a7' },
  { label: 'Teal', value: '#00796b' },
  { label: 'Light Green', value: '#689f38' },
  { label: 'Lime', value: '#afb42b' },
  { label: 'Amber', value: '#ffa000' },
  { label: 'Orange', value: '#f57c00' },
  { label: 'Deep Orange', value: '#e64a19' },
  { label: 'Brown', value: '#5d4037' },
  { label: 'Blue Grey', value: '#455a64' },
  { label: 'Grey', value: '#616161' },
];

export default function SettingsPage() {
  const { themeColor, setThemeColor } = useAppTheme();
  const { showSnackbar } = useSnackbar();
  const [savingColor, setSavingColor] = useState<string | null>(null);

  const handleSelect = async (color: string) => {
    if (color === themeColor || savingColor) return;

    setSavingColor(color);
    try {
      await setThemeColor(color);
      showSnackbar({ message: 'Theme color updated', severity: 'success' });
    } catch {
      showSnackbar({ message: 'Failed to update theme color', severity: 'error' });
    } finally {
      setSavingColor(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Dashboard &bull; Settings &bull; Theme Color
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 640 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Theme Color
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Pick a primary color for the app. This applies to every user in your organization.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {COLOR_SWATCHES.map((swatch) => {
            const isSelected = swatch.value.toLowerCase() === themeColor.toLowerCase();
            const isSaving = savingColor === swatch.value;

            return (
              <Tooltip key={swatch.value} title={swatch.label}>
                <Box
                  role="button"
                  aria-label={swatch.label}
                  onClick={() => handleSelect(swatch.value)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: swatch.value,
                    cursor: savingColor ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: (theme) =>
                      isSelected ? `2px solid ${theme.palette.text.primary}` : '2px solid transparent',
                    outline: isSelected ? `2px solid ${swatch.value}` : 'none',
                    outlineOffset: '2px',
                    transition: 'transform 0.15s ease',
                    '&:hover': {
                      transform: savingColor ? 'none' : 'scale(1.1)',
                    },
                  }}
                >
                  {isSaving ? (
                    <CircularProgress size={16} sx={{ color: '#fff' }} />
                  ) : isSelected ? (
                    <CheckIcon sx={{ color: '#fff', fontSize: 20 }} />
                  ) : null}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
