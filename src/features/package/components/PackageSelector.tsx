// src/features/package/components/PackageSelector.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Controller, useWatch } from 'react-hook-form';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import InventoryIcon from '@mui/icons-material/Inventory';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EntityAutocomplete from '../../../components/common/EntityAutocomplete';


/* ---------------- TYPES ---------------- */
interface PackageSelectorProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}

export default function PackageSelector({
  control,
  setValue,
}: PackageSelectorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  // Editing an enquiry already linked to a package should open on "Inventory", not default to "Custom".
  const initialPkgUuid = useWatch({ control, name: 'pkg_uuid' });
  const [packageMode, setPackageMode] = useState<'custom' | 'existing'>(() =>
    initialPkgUuid ? 'existing' : 'custom'
  );

  // The active mode itself is part of the submitted form data (see enquiry.schema.ts) —
  // push the derived initial value in once so validation reflects it from the start.
  useEffect(() => {
    setValue('package_mode', packageMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handlePackageModeChange = (
    _: React.MouseEvent<HTMLElement>,
    value: 'custom' | 'existing' | null
  ) => {
    if (!value) return;

    setPackageMode(value);
    setValue('package_mode', value);

    // Only the currently active side is what gets submitted (see EnquiryForm's submit
    // handler) — toggling itself must never erase what's already typed/selected.
    if (value === 'custom') {
      setValue('pkg_uuid', null);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={2}
      >
        <Typography variant="h6" color="primary">
          {t('enquiry.packageSelection')}
        </Typography>

        <ToggleButtonGroup
          value={packageMode}
          exclusive
          onChange={handlePackageModeChange}
          size="small"
          fullWidth={isMobile}
          sx={{ '& .MuiToggleButton-root': { flex: 1 } }}
        >
          <ToggleButton value="custom">
            <EditNoteIcon fontSize="small" sx={{ mr: 1 }} />
            {t('common.custom')}
          </ToggleButton>

          <ToggleButton value="existing">
            <InventoryIcon fontSize="small" sx={{ mr: 1 }} />
            {t('common.inventory')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Body */}
      <Grid container spacing={2}>
        {packageMode === 'custom' ? (
          <Grid size={{ xs: 12 }}>
            <Controller
              name="package_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('enquiry.packageName')}
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        ) : (
          <Grid size={{ xs: 12 }}>
            <EntityAutocomplete
              name="pkg_uuid"
              label={t('enquiry.selectPackage')}
              control={control}
              dropdownName="packages"
              setValue={setValue}
              autoFillMap={{
                package_name: 'label',
              }}
            />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
