import { Box, TextField, MenuItem, Button, Grid } from '@mui/material';

export default function EnquiryFilters() {
  return (
    <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField label="From Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField label="To Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField select label="Status" fullWidth defaultValue="">
            <MenuItem value="Hot">Hot</MenuItem>
            <MenuItem value="Warm">Warm</MenuItem>
            <MenuItem value="Cold">Cold</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField label="Customer Name" fullWidth />
        </Grid>

        {/* Row 2 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField label="Mobile Number" fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField label="Agent Name" fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField select label="Lead Source" fullWidth defaultValue="">
             <MenuItem value="WalkIn">Walk-In</MenuItem>
             <MenuItem value="Website">Website</MenuItem>
          </TextField>
        </Grid>

        {/* Actions */}
        <Grid size={12} display="flex" justifyContent="flex-end" gap={1}>
          <Button color="inherit">Reset</Button>
          <Button variant="contained">Apply Filters</Button>
        </Grid>
      </Grid>
    </Box>
  );
}