import React from 'react';
import {
  Box,
  Button,
  MenuItem,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { enquirySchema } from '../enquiry.schema';
import type { z } from 'zod';

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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EnquiryFormInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      cust_id: undefined,
      pax_count: 1,
      type: 'General',
      status: 'Warm',
      conversion_status: 'Pending',
      ...defaultValues,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        {/* Customer */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="cust_id"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Customer ID"
                type="number"
                fullWidth
                required
                error={!!errors.cust_id}
                helperText={errors.cust_id?.message}
              />
            )}
          />
        </Grid>

        {/* Pax */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="pax_count"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="PAX Count"
                type="number"
                fullWidth
                required
                error={!!errors.pax_count}
                helperText={errors.pax_count?.message}
              />
            )}
          />
        </Grid>

        {/* Enquiry Type */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Type" fullWidth>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Warm">Warm</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Status" fullWidth>
                <MenuItem value="Hot">Hot</MenuItem>
                <MenuItem value="Warm">Warm</MenuItem>
                <MenuItem value="Cold">Cold</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        {/* Conversion Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="conversion_status"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Conversion" fullWidth>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Converted">Converted</MenuItem>
                <MenuItem value="Lost">Lost</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        {/* Submit */}
        <Grid size={{ xs: 12 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Enquiry'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
