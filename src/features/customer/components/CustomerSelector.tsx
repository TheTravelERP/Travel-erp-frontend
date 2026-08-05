// src/features/customer/components/CustomerSelector.tsx

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

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

import EntityAutocomplete from '../../../components/common/EntityAutocomplete';
import MobileNumberField from '../../../components/common/MobileNumberField';

/* ---------------- TYPES ---------------- */
interface CustomerSelectorProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  disabled?: boolean;
}

export default function CustomerSelector({
  control,
  setValue,
  disabled = false,
}: CustomerSelectorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  // Editing an enquiry already linked to a customer should open on "Existing", not default to "New".
  const custUuidWatched = useWatch({ control, name: 'cust_uuid' });
  const [mode, setMode] = useState<'new' | 'existing'>(() =>
    custUuidWatched ? 'existing' : 'new'
  );

  // The active mode itself is part of the submitted form data (see enquiry.schema.ts) —
  // push the derived initial value in once so validation reflects it from the start.
  useEffect(() => {
    setValue('customer_mode', mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A populated cust_uuid always means the enquiry is genuinely linked to a
  // real Customer — keep the toggle in sync with that for the *lifetime* of
  // the form, not just at mount. Without this, cust_uuid getting (re)populated
  // after mount (e.g. linking a customer from the Quotation screen, then
  // coming back to this Enquiry) leaves `mode` stuck on its stale initial
  // 'new', so an untouched Save would null the real link right back out (see
  // submitActiveModes in EnquiryForm.tsx). Deliberately one-directional: an
  // empty cust_uuid never forces mode back to 'new', since that's ambiguous
  // with "Existing selected, nothing picked yet" and would fight the user's
  // own toggle clicks.
  useEffect(() => {
    if (custUuidWatched && mode !== 'existing') {
      setMode('existing');
      setValue('customer_mode', 'existing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custUuidWatched]);

  /* ---------------- HANDLERS ---------------- */
  const handleModeChange = (
    _: React.MouseEvent<HTMLElement>,
    value: 'new' | 'existing' | null
  ) => {
    if (!value) return;

    setMode(value);
    setValue('customer_mode', value);

    // Only the currently active side is what gets submitted (see EnquiryForm's submit
    // handler) — toggling itself must never erase what's already typed/selected.
    if (value === 'new') {
      setValue('cust_uuid', null);
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
          {t('enquiry.customerInformation')}
        </Typography>

        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          size="small"
          fullWidth={isMobile}
          disabled={disabled}
          sx={{ '& .MuiToggleButton-root': { flex: 1 } }}
        >
          <ToggleButton value="new">
            <PersonAddIcon fontSize="small" sx={{ mr: 1 }} />
            {t('common.new')}
          </ToggleButton>

          <ToggleButton value="existing">
            <PersonSearchIcon fontSize="small" sx={{ mr: 1 }} />
            {t('common.existing')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Body */}
      <Grid container spacing={2}>
        {mode === 'new' ? (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="customer_name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('common.customerName')}
                    required
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <MobileNumberField name="customer_mobile" control={control} label={t('common.mobile')} required disabled={disabled} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="customer_email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('common.email')}
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          </>
        ) : (
         <Grid size={{ xs: 12 }}>
          <EntityAutocomplete
            name="cust_uuid"
            label={t('enquiry.searchCustomer')}
            control={control}
            dropdownName="customers"
            setValue={setValue}
            disabled={disabled}
            allowAdd
            onAddNew={() => console.log("Open modal")}
            autoFillMap={{
              customer_name: "label",
              customer_mobile: "mobile",
              customer_email: "email",
            }}
          />
        </Grid>
        )}
      </Grid>
    </Paper>
  );
}
