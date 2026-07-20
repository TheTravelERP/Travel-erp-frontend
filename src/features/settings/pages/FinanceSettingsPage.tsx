// src/features/settings/pages/FinanceSettingsPage.tsx
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
  IconButton,
  Radio,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  fetchOrganizationSettings,
  updateOrganizationSettings,
} from '../../../services/organization.service';
import { fetchSettings, updateSettings } from '../../../services/systemSetting.service';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';
import { useTranslation } from 'react-i18next';

const DECIMAL_OPTIONS = ['0', '2', '3'];

interface TaxRate {
  name: string;
  percent: number;
  is_default: boolean;
}

export default function FinanceSettingsPage() {
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [baseCurrency, setBaseCurrency] = useState('');
  const [decimalPlaces, setDecimalPlaces] = useState('2');
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetchOrganizationSettings(controller.signal),
      fetchSettings('finance', controller.signal),
    ])
      .then(([org, finance]) => {
        setBaseCurrency(org.base_currency);
        setDecimalPlaces(finance.settings.decimal_places ?? '2');
        try {
          setTaxRates(finance.settings.tax_rates ? JSON.parse(finance.settings.tax_rates) : []);
        } catch {
          setTaxRates([]);
        }
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

  const addTaxRate = () => {
    setTaxRates((prev) => [...prev, { name: '', percent: 0, is_default: prev.length === 0 }]);
  };

  const removeTaxRate = (index: number) => {
    setTaxRates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTaxRate = (index: number, patch: Partial<TaxRate>) => {
    setTaxRates((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const setDefaultTaxRate = (index: number) => {
    setTaxRates((prev) => prev.map((r, i) => ({ ...r, is_default: i === index })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateOrganizationSettings({ base_currency: baseCurrency }),
        updateSettings('finance', {
          decimal_places: decimalPlaces,
          tax_rates: JSON.stringify(taxRates),
        }),
      ]);
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
        {t('menu.settings.finance')}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {t('menu.dashboard')} &bull; {t('menu.settings')} &bull; {t('menu.settings.finance')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3, maxWidth: 880 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('settings.currency')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label={t('settings.baseCurrency')}
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value.toUpperCase())}
              inputProps={{ maxLength: 3 }}
              helperText={t('settings.baseCurrencyHint')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              fullWidth
              label={t('settings.decimalPlaces')}
              value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(e.target.value)}
            >
              {DECIMAL_OPTIONS.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 880 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {t('settings.taxRates')}
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addTaxRate}>
            {t('settings.addRate')}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t('settings.taxRatesHint')}
        </Typography>

        <Stack spacing={1.5}>
          {taxRates.map((rate, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Radio
                size="small"
                checked={rate.is_default}
                onChange={() => setDefaultTaxRate(index)}
                title={t('settings.defaultRate')}
              />
              <TextField
                size="small"
                label={t('settings.name')}
                placeholder="e.g. VAT, GST"
                value={rate.name}
                onChange={(e) => updateTaxRate(index, { name: e.target.value })}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label={t('settings.percent')}
                type="number"
                value={rate.percent}
                onChange={(e) => updateTaxRate(index, { percent: Number(e.target.value) })}
                sx={{ width: 120 }}
              />
              <IconButton size="small" onClick={() => removeTaxRate(index)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          {taxRates.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('settings.noTaxRatesYet')}
            </Typography>
          )}
        </Stack>
      </Paper>

      <Divider sx={{ my: 3, maxWidth: 880 }} />

      <Button variant="contained" disabled={saving} onClick={handleSave}>
        {saving ? t('common.saving') : t('common.save')}
      </Button>
    </Box>
  );
}
