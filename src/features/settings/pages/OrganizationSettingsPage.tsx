// src/features/settings/pages/OrganizationSettingsPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  fetchOrganizationSettings,
  updateOrganizationSettings,
  type OrganizationProfile,
  type OrganizationProfileUpdate,
} from '../../../services/organization.service';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';

const DATE_FORMATS = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];
const TIME_FORMAT_VALUES = ['24h', '12h'] as const;
const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const EDITABLE_FIELDS = [
  'name', 'legal_name', 'logo_url', 'website', 'email', 'mobile',
  'address', 'city', 'state', 'tax_registration_label', 'tax_registration_number',
  'timezone', 'date_format', 'time_format', 'financial_year_start_month',
] as const;

export default function OrganizationSettingsPage() {
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OrganizationProfile | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrganizationSettings(controller.signal)
      .then(setForm)
      .catch((err) => {
        if (!axios.isCancel(err)) {
          showSnackbar({ message: t('common.loadFailed'), severity: 'error' });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (field: keyof OrganizationProfile, value: string | number) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload: OrganizationProfileUpdate = {};
      for (const key of EDITABLE_FIELDS) {
        (payload as any)[key] = form[key];
      }
      const updated = await updateOrganizationSettings(payload);
      setForm(updated);
      showSnackbar({ message: t('common.updatedSuccess'), severity: 'success' });
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail ?? t('common.updateFailed'),
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {t('menu.settings.organization')}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {t('menu.dashboard')} &bull; {t('menu.settings')} &bull; {t('menu.settings.organization')}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 880 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('settings.companyProfile')}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('auth.organizationName')} value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('settings.legalName')} value={form.legal_name ?? ''} onChange={(e) => setField('legal_name', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('settings.website')} value={form.website ?? ''} onChange={(e) => setField('website', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('settings.logoUrl')} value={form.logo_url ?? ''} onChange={(e) => setField('logo_url', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('common.email')} value={form.email ?? ''} onChange={(e) => setField('email', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('common.mobile')} value={form.mobile ?? ''} onChange={(e) => setField('mobile', e.target.value)} placeholder="+14155550100" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label={t('settings.address')} value={form.address ?? ''} onChange={(e) => setField('address', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('settings.city')} value={form.city ?? ''} onChange={(e) => setField('city', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('settings.stateRegion')} value={form.state ?? ''} onChange={(e) => setField('state', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('common.country')} value={form.country_code} disabled helperText={t('settings.setAtSignup')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('settings.baseCurrency')} value={form.base_currency} disabled helperText={t('settings.editUnderCurrencyTax')} />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('settings.taxRegistration')}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t('settings.taxRegistrationHint')}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('settings.registrationLabel')}
              placeholder={t('settings.registrationLabelPlaceholder')}
              value={form.tax_registration_label ?? ''}
              onChange={(e) => setField('tax_registration_label', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('settings.registrationNumber')}
              value={form.tax_registration_number ?? ''}
              onChange={(e) => setField('tax_registration_number', e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('settings.locale')}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('settings.timezone')}
              value={form.timezone}
              onChange={(e) => setField('timezone', e.target.value)}
              placeholder={t('settings.timezonePlaceholder')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField select fullWidth label={t('settings.dateFormat')} value={form.date_format} onChange={(e) => setField('date_format', e.target.value)}>
              {DATE_FORMATS.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField select fullWidth label={t('settings.timeFormat')} value={form.time_format} onChange={(e) => setField('time_format', e.target.value)}>
              {TIME_FORMAT_VALUES.map((v) => (
                <MenuItem key={v} value={v}>{t(`settings.time${v}`)}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label={t('settings.financialYearStarts')}
              value={form.financial_year_start_month}
              onChange={(e) => setField('financial_year_start_month', Number(e.target.value))}
            >
              {MONTH_KEYS.map((m, i) => (
                <MenuItem key={m} value={i + 1}>{t(`common.months.${m}`)}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Button variant="contained" disabled={saving} onClick={handleSave}>
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </Paper>
    </Box>
  );
}
