import React, { useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Typography,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid'; // In v7, this is the stable Grid2 logic
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { enquirySchema } from '../enquiry.schema';
import type { z } from 'zod';

export type EnquiryFormInput = z.infer<typeof enquirySchema>;

/* ---------------- MOCK DATA ---------------- */
const MOCK_CUSTOMERS = [
  { id: 1, name: 'John Doe', mobile: '9999999999' },
  { id: 2, name: 'Aadil Hussain', mobile: '8888888888' },
];

const MOCK_PACKAGES = [
  { id: 101, name: 'Umrah Economy 2025' },
  { id: 102, name: 'Turkey Tour 7D/6N' },
];

interface EnquiryFormProps {
  defaultValues?: Partial<EnquiryFormInput>;
  onSubmit: (data: EnquiryFormInput) => Promise<void>;
  loading?: boolean;
}

export default function EnquiryForm({
  defaultValues,
  onSubmit,
  loading = false,
}: EnquiryFormProps) {
  const { control, handleSubmit, setValue } = useForm<EnquiryFormInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      cust_id: null,
      customer_name: '',
      customer_mobile: '',
      pkg_id: null,
      package_name: '',
      lead_source: 'WalkIn',
      pax_count: 1,
      status: 'Warm',
      conversion_status: 'Pending',
      description: '',
      ...defaultValues,
    },
  });

  const [customerMode, setCustomerMode] = useState<'new' | 'existing'>('new');
  const [packageMode, setPackageMode] = useState<'custom' | 'existing'>('custom');

  const handleCustomerModeChange = (_: any, value: 'new' | 'existing') => {
    if (!value) return;
    setCustomerMode(value);
    setValue('cust_id', null);
    setValue('customer_name', '');
    setValue('customer_mobile', '');
  };

  const handlePackageModeChange = (_: any, value: 'custom' | 'existing') => {
    if (!value) return;
    setPackageMode(value);
    setValue('pkg_id', null);
    setValue('package_name', '');
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        
        {/* ================= CUSTOMER SECTION ================= */}
        <Grid size={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" fontWeight={700}>Customer Information</Typography>
            <ToggleButtonGroup
              value={customerMode}
              exclusive
              onChange={handleCustomerModeChange}
              size="small"
              color="primary"
            >
              <ToggleButton value="new">New</ToggleButton>
              <ToggleButton value="existing">Existing</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Divider />
        </Grid>

        {customerMode === 'new' ? (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="customer_name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField 
                    {...field} 
                    label="Customer Name" 
                    fullWidth 
                    required 
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="customer_mobile"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Mobile Number" fullWidth />
                )}
              />
            </Grid>
          </>
        ) : (
          <Grid size={12}>
            <Controller
              name="cust_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={MOCK_CUSTOMERS}
                  getOptionLabel={(o) => `${o.name} (${o.mobile})`}
                  onChange={(_, v) => field.onChange(v?.id ?? null)}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Existing Customer" fullWidth />
                  )}
                />
              )}
            />
          </Grid>
        )}

        {/* ================= PACKAGE SECTION ================= */}
        <Grid size={12} sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" fontWeight={700}>Package Details</Typography>
            <ToggleButtonGroup
              value={packageMode}
              exclusive
              onChange={handlePackageModeChange}
              size="small"
              color="primary"
            >
              <ToggleButton value="custom">Custom</ToggleButton>
              <ToggleButton value="existing">Inventory</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Divider />
        </Grid>

        <Grid size={12}>
          {packageMode === 'custom' ? (
            <Controller
              name="package_name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Custom Package Name" fullWidth placeholder="e.g. Family Trip to Switzerland" />
              )}
            />
          ) : (
            <Controller
              name="pkg_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={MOCK_PACKAGES}
                  getOptionLabel={(o) => o.name}
                  onChange={(_, v) => field.onChange(v?.id ?? null)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select from Packages" fullWidth />
                  )}
                />
              )}
            />
          )}
        </Grid>

        {/* ================= ENQUIRY DETAILS ================= */}
        <Grid size={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>Lead Logistics</Typography>
          <Divider />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="lead_source"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Lead Source" fullWidth>
                <MenuItem value="Website">Website</MenuItem>
                <MenuItem value="Agent">Agent</MenuItem>
                <MenuItem value="WalkIn">Walk-In</MenuItem>
                <MenuItem value="Referral">Referral</MenuItem>
                <MenuItem value="Corporate">Corporate</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pax_count"
            control={control}
            render={({ field }) => (
              <TextField {...field} type="number" label="Number of Persons (PAX)" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Priority Status" fullWidth>
                <MenuItem value="Hot">🔥 Hot</MenuItem>
                <MenuItem value="Warm">☀️ Warm</MenuItem>
                <MenuItem value="Cold">❄️ Cold</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        <Grid size={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Internal Notes"
                multiline
                rows={4}
                fullWidth
                placeholder="Mention specific requirements like budget, dates, or hotel preferences..."
              />
            )}
          />
        </Grid>

        {/* ================= ACTIONS ================= */}
        <Grid size={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading} size="large">
            {loading ? 'Processing...' : 'Create Enquiry'}
          </Button>
        </Grid>

      </Grid>
    </Box>
  );
}