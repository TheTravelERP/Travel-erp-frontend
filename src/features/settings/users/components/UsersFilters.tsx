// src/features/settings/users/components/UsersFilters.tsx
import { Box, TextField, Button, Grid, Typography, Stack, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DropdownAutocomplete from '../../../../components/common/DropdownAutocomplete';

export interface UsersFilterValues {
  search?: string;
  user_type?: string;
  status?: string;
  designation?: string;
  gender?: string;
}

interface UsersFiltersProps {
  value: UsersFilterValues;
  onChange: (v: Partial<UsersFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

const USER_TYPES = ['Admin', 'Employee', 'Agent'];
const STATUSES = ['Active', 'Inactive', 'Suspended'];

export default function UsersFilters({ value, onChange, onApply, onReset }: UsersFiltersProps) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'grey.50',
        borderRadius: 2,
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={1.5} mb={2}>
        <Typography variant="h6" color="primary">
          {t('common.filters')}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label={t('settings.role')}
            fullWidth
            value={value.user_type ?? ''}
            onChange={(e) => onChange({ user_type: e.target.value || undefined })}
          >
            <MenuItem value="">{t('settings.any')}</MenuItem>
            {USER_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {t(`settings.userType.${type}`, { defaultValue: type })}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label={t('common.status')}
            fullWidth
            value={value.status ?? ''}
            onChange={(e) => onChange({ status: e.target.value || undefined })}
          >
            <MenuItem value="">{t('settings.any')}</MenuItem>
            {STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {t(`settings.userStatus.${status}`, { defaultValue: status })}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <DropdownAutocomplete
            name="designation"
            label={t('settings.designation')}
            value={value.designation ?? null}
            onChange={(val: string | null) => onChange({ designation: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <DropdownAutocomplete
            name="gender"
            label={t('settings.gender')}
            value={value.gender ?? null}
            onChange={(val: string | null) => onChange({ gender: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={12} display="flex" justifyContent="flex-end" gap={1} mt={1}>
          <Button color="inherit" onClick={onReset}>
            {t('common.reset')}
          </Button>
          <Button variant="contained" onClick={onApply}>
            {t('common.applyFilters')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
