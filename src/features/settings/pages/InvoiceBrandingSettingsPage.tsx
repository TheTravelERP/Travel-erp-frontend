// src/features/settings/pages/InvoiceBrandingSettingsPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
} from '@mui/material';
import { fetchSettings, updateSettings } from '../../../services/systemSetting.service';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';
import { useTranslation } from 'react-i18next';

const DEFAULTS = {
  tax_inclusive: 'false',
  footer_text: '',
  terms_and_conditions: '',
  show_qr_code: 'false',
  show_digital_signature: 'false',
  invoice_logo_url: '',
  favicon_url: '',
  watermark_url: '',
  pdf_header_text: '',
  pdf_footer_text: '',
};

type FormState = typeof DEFAULTS;

export default function InvoiceBrandingSettingsPage() {
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULTS);

  useEffect(() => {
    const controller = new AbortController();
    fetchSettings('invoice_branding', controller.signal)
      .then((res) => {
        setForm({ ...DEFAULTS, ...(res.settings as Partial<FormState>) });
      })
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

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings('invoice_branding', form);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {t('menu.settings.invoice_branding')}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {t('menu.dashboard')} &bull; {t('menu.settings')} &bull; {t('menu.settings.invoice_branding')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3, maxWidth: 880 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('settings.invoice')}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t('settings.invoiceNumberingHint')}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.tax_inclusive === 'true'}
                  onChange={(e) => setField('tax_inclusive', String(e.target.checked))}
                />
              }
              label={t('settings.pricesTaxInclusive')}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.show_qr_code === 'true'}
                  onChange={(e) => setField('show_qr_code', String(e.target.checked))}
                />
              }
              label={t('settings.showQrCode')}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.show_digital_signature === 'true'}
                  onChange={(e) => setField('show_digital_signature', String(e.target.checked))}
                />
              }
              label={t('settings.showDigitalSignature')}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label={t('settings.invoiceFooter')}
              value={form.footer_text}
              onChange={(e) => setField('footer_text', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label={t('settings.termsAndConditions')}
              value={form.terms_and_conditions}
              onChange={(e) => setField('terms_and_conditions', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 880 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('settings.branding')}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t('settings.brandingHint')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('settings.invoiceLogoUrl')}
              value={form.invoice_logo_url}
              onChange={(e) => setField('invoice_logo_url', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('settings.faviconUrl')}
              value={form.favicon_url}
              onChange={(e) => setField('favicon_url', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('settings.watermarkUrl')}
              value={form.watermark_url}
              onChange={(e) => setField('watermark_url', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('settings.pdfHeaderText')}
              value={form.pdf_header_text}
              onChange={(e) => setField('pdf_header_text', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('settings.pdfFooterText')}
              value={form.pdf_footer_text}
              onChange={(e) => setField('pdf_footer_text', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 3, maxWidth: 880 }} />

      <Button variant="contained" disabled={saving} onClick={handleSave}>
        {saving ? t('common.saving') : t('common.save')}
      </Button>
    </Box>
  );
}
