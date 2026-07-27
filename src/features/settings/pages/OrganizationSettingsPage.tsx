// src/features/settings/pages/OrganizationSettingsPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  fetchOrganizationSettings,
  updateOrganizationSettings,
  type OrganizationProfile,
  type OrganizationProfileUpdate,
} from '../../../services/organization.service';
import { uploadFile } from '../../../services/upload.service';
import FileUploadField from '../../../components/common/FileUploadField';
import MobileNumberField from '../../../components/common/MobileNumberField';
import EntityAutocomplete from '../../../components/common/EntityAutocomplete';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const DOC_SLOTS = ['doc1', 'doc2', 'doc3', 'doc4'] as const;

const EDITABLE_FIELDS = [
  'name', 'legal_name', 'logo_url', 'header_image_url', 'footer_image_url',
  'doc1_label', 'doc1_url', 'doc2_label', 'doc2_url',
  'doc3_label', 'doc3_url', 'doc4_label', 'doc4_url',
  'website', 'email', 'mobile',
  'address', 'city', 'state',
  'localization_profile_uuid', 'tax_registration_uuid',
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
        const value = form[key];
        // localization_profile_uuid/tax_registration_uuid are real UUID
        // fields on the backend — omit rather than send "" when unset.
        if (value === '' && (key === 'localization_profile_uuid' || key === 'tax_registration_uuid')) {
          continue;
        }
        (payload as any)[key] = value;
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
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
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
            <TextField fullWidth label={t('common.email')} value={form.email ?? ''} onChange={(e) => setField('email', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MobileNumberField
              useForm={false}
              label={t('common.mobile')}
              value={form.mobile ?? ''}
              onChange={(value) => setField('mobile', value)}
            />
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
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t('settings.branding')}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FileUploadField
              label={t('settings.logoUrl')}
              variant="avatar"
              value={form.logo_url}
              onUpload={async (file) => (await uploadFile(file, 'organization', 'logo')).url}
              onChange={(url) => setField('logo_url', url ?? '')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FileUploadField
              label={t('settings.headerImage')}
              variant="document"
              value={form.header_image_url}
              onUpload={async (file) => (await uploadFile(file, 'organization', 'header_image')).url}
              onChange={(url) => setField('header_image_url', url ?? '')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FileUploadField
              label={t('settings.footerImage')}
              variant="document"
              value={form.footer_image_url}
              onUpload={async (file) => (await uploadFile(file, 'organization', 'footer_image')).url}
              onChange={(url) => setField('footer_image_url', url ?? '')}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t('settings.documents')}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {DOC_SLOTS.map((slot) => (
            <Grid key={slot} size={{ xs: 12, sm: 6 }}>
              <Stack spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('settings.documentLabel')}
                  value={form[`${slot}_label`] ?? ''}
                  onChange={(e) => setField(`${slot}_label`, e.target.value)}
                />
                <FileUploadField
                  label={t('settings.documentFile')}
                  variant="document"
                  value={form[`${slot}_url`]}
                  onUpload={async (file) => (await uploadFile(file, 'organization', slot)).url}
                  onChange={(url) => setField(`${slot}_url`, url ?? '')}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                />
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t('settings.taxRegistration')}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t('settings.taxRegistrationHint')}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="tax_registration_uuid"
              label={t('menu.settings.tax_registration')}
              dropdownName="tax_registration"
              useForm={false}
              value={form.tax_registration_uuid}
              onChange={(v) => setField('tax_registration_uuid', v ?? '')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label={t('settings.registrationLabel')} value={form.tax_registration_label ?? '-'} disabled />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label={t('settings.registrationNumber')} value={form.tax_registration_number ?? '-'} disabled />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t('settings.locale')}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="localization_profile_uuid"
              label={t('menu.settings.localization_profile')}
              dropdownName="localization_profile"
              useForm={false}
              value={form.localization_profile_uuid}
              onChange={(v) => setField('localization_profile_uuid', v ?? '')}
            />
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('localizationProfile.sectionGeneral')}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label={t('localizationProfile.defaultCurrency')} value={form.base_currency} disabled />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label={t('settings.timezone')} value={form.timezone} disabled />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label={t('settings.dateFormat')} value={form.date_format} disabled />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label={t('settings.timeFormat')} value={t(`settings.time${form.time_format}`)} disabled />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('settings.financialYearStarts')}
              value={t(`common.months.${MONTH_KEYS[form.financial_year_start_month - 1]}`)}
              disabled
            />
          </Grid>
        </Grid>

        <Button variant="contained" disabled={saving} onClick={handleSave}>
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </Paper>
    </Box>
  );
}
