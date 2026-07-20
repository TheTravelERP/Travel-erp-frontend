// src/features/customer/components/CustomerSelector.tsx

import { useState } from 'react';
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
import { Controller } from 'react-hook-form';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

import EntityAutocomplete from '../../../components/common/EntityAutocomplete';

/* ---------------- TYPES ---------------- */
interface CustomerSelectorProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}

export default function CustomerSelector({
  control,
  setValue,
}: CustomerSelectorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  const [mode, setMode] = useState<'new' | 'existing'>('new');

  /* ---------------- HANDLERS ---------------- */
  const handleModeChange = (
    _: React.MouseEvent<HTMLElement>,
    value: 'new' | 'existing' | null
  ) => {
    if (!value) return;

    setMode(value);
    setValue('cust_id', null);
    setValue('customer_name', '');
    setValue('customer_mobile', '');
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
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="customer_mobile"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('common.mobile')}
                    required
                    placeholder="+14155550100"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
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
            name="cust_id"
            label={t('enquiry.searchCustomer')}
            control={control}
            dropdownName="customers"
            setValue={setValue}
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
