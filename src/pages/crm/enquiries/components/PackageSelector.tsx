import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { Controller } from "react-hook-form";
import type { Control, UseFormSetValue } from "react-hook-form";

import InventoryIcon from '@mui/icons-material/Inventory';
import EditNoteIcon from '@mui/icons-material/EditNote';

/* ---------------- MOCK DATA (replace with API later) ---------------- */
const MOCK_PACKAGES = [
  { id: 101, name: 'Umrah Economy 2025' },
  { id: 102, name: 'Turkey Tour 7D/6N' },
];

/* ---------------- TYPES ---------------- */
interface PackageSelectorProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}

export default function PackageSelector({
  control,
  setValue,
}: PackageSelectorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [packageMode, setPackageMode] = useState<'custom' | 'existing'>('custom');
    

  /* ---------------- HANDLERS ---------------- */
    const handlePackageModeChange = (_: any, value: 'custom' | 'existing') => {
        if (!value) return;
        setPackageMode(value);
        setValue('pkg_id', null);
        setValue('package_name', '');
    };
  /* ---------------- RENDER ---------------- */
  return (
     <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, height: '100%' }}>
        <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={2}
            mb={2}
        >
            <Typography fontWeight={700} color="primary">
            Package Selection
            </Typography>

            <ToggleButtonGroup
            value={packageMode}
            exclusive
            onChange={handlePackageModeChange}
            size="small"
            fullWidth={isMobile}
            sx={{ '& .MuiToggleButton-root': { flex: 1 } }}
            >
            <ToggleButton value="custom">
                <EditNoteIcon sx={{ mr: 1 }} /> Custom
            </ToggleButton>
            <ToggleButton value="existing">
                <InventoryIcon sx={{ mr: 1 }} /> Inventory
            </ToggleButton>
            </ToggleButtonGroup>
        </Box>
        <Grid container spacing={2} size={{ xs: 12, md: 12 }}>
            {packageMode === 'custom' ? (
                <Controller
                name="package_name"
                control={control}
                render={({ field }) => (
                    <TextField {...field} label="Package Name" fullWidth required />
                )}
                />
            ) : (
                <Controller
                name="pkg_id"
                control={control}
                render={({ field }) => (
                    <Autocomplete
                    fullWidth
                    options={MOCK_PACKAGES}
                    getOptionLabel={(o) => o.name}
                    onChange={(_, v) => {
                        field.onChange(v?.id ?? null);
                        if (v) setValue('package_name', v.name);
                    }}
                    renderInput={(params) => <TextField {...params} label="Select Package" fullWidth />}
                    />
                )}
                />
            )}
        </Grid>
    </Paper>
  );
}
