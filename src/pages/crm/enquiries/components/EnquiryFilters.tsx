// src/pages/crm/enquiries/components/EnquiryFilters.tsx

import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Typography,
  Stack,
} from '@mui/material';
import { CONVERSION_STATUS_OPTIONS } from '../../../../constants/enquiry.options';

/* ================= TYPES ================= */

export interface EnquiryFilterValues {
  conversion_status?: string;
  agent_name?: string;
  from_date?: string;
  to_date?: string;
  lead_source?: string;
}

interface EnquiryFiltersProps {
  value: EnquiryFilterValues;
  onChange: (v: Partial<EnquiryFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */

export default function EnquiryFilters({
  value,
  onChange,
  onApply,
  onReset,
}: EnquiryFiltersProps) {
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
      {/* Header */}
      <Stack spacing={1.5} mb={2}>
        <Typography variant="h6" color="primary">
          Filters
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {/* Date Range */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="From Date"
            type="date"
            fullWidth
            value={value.from_date ?? ''}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => onChange({ from_date: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="To Date"
            type="date"
            fullWidth
            value={value.to_date ?? ''}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => onChange({ to_date: e.target.value })}
          />
        </Grid>

        {/* Conversion Status */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label="Conversion Status"
            fullWidth
            value={value.conversion_status ?? ''}
            onChange={(e) =>
              onChange({ conversion_status: e.target.value })
            }
          >
            <MenuItem value="">All</MenuItem>
            {CONVERSION_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Lead Source */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label="Lead Source"
            fullWidth
            value={value.lead_source ?? ''}
            onChange={(e) => onChange({ lead_source: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="WalkIn">Walk-In</MenuItem>
            <MenuItem value="Website">Website</MenuItem>
          </TextField>
        </Grid>

        {/* Agent */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Agent Name"
            fullWidth
            value={value.agent_name ?? ''}
            onChange={(e) => onChange({ agent_name: e.target.value })}
          />
        </Grid>

        {/* Actions */}
        <Grid
          size={12}
          display="flex"
          justifyContent="flex-end"
          gap={1}
          mt={1}
        >
          <Button color="inherit" onClick={onReset}>
            Reset
          </Button>
          <Button variant="contained" onClick={onApply}>
            Apply Filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
