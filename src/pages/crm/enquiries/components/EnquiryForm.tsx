import React, { useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import GroupIcon from '@mui/icons-material/Group';
import { enquirySchema } from '../enquiry.schema';
import type { z } from 'zod';
import CustomerSelector from './CustomerSelector';
import PackageSelector from './PackageSelector';

export type EnquiryFormInput = z.infer<typeof enquirySchema>;

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

  /* ---------------- FORM ---------------- */
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<EnquiryFormInput>({
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

  /* ---------------- RENDER ---------------- */
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomerSelector control={control} setValue={setValue} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
         <PackageSelector control={control} setValue={setValue} />
        </Grid>

        {/* ENQUIRY DETAILS */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Paper variant="outlined" sx={{ p:  2, borderRadius: 2 }}>
            <Typography fontWeight={700} color="primary" mb={2}>
              Enquiry Details
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="lead_source"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Source" fullWidth>
                      <MenuItem value="Website">Website</MenuItem>
                      <MenuItem value="Agent">Agent</MenuItem>
                      <MenuItem value="WalkIn">Walk-In</MenuItem>
                      <MenuItem value="Referral">Referral</MenuItem>
                      <MenuItem value="Corporate">Corporate</MenuItem>
                      <MenuItem value="Others">Others</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="pax_count"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="PAX Count"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <GroupIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Priority" fullWidth>
                      <MenuItem value="Hot">🔥 Hot</MenuItem>
                      <MenuItem value="Warm">☀️ Warm</MenuItem>
                      <MenuItem value="Cold">❄️ Cold</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Notes" multiline rows={2} fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ================= ROW 3: ACTIONS ================= */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => reset()}
              size="large"
            >
              Discard
            </Button>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? 'Saving...' : 'Save Enquiry'}
            </Button>
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
}
