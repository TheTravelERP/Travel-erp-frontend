import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { Controller } from "react-hook-form";
import type { Control, UseFormSetValue } from "react-hook-form";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

/* ---------------- MOCK DATA (replace with API later) ---------------- */
const MOCK_CUSTOMERS = [
  { id: 1, name: "John Doe", mobile: "9999999999" },
  { id: 2, name: "Aadil Hussain", mobile: "8888888888" },
];

/* ---------------- TYPES ---------------- */
interface CustomerSelectorProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}

export default function CustomerSelector({
  control,
  setValue,
}: CustomerSelectorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mode, setMode] = useState<"new" | "existing">("new");

  /* ---------------- HANDLERS ---------------- */
  const handleModeChange = (
    _: React.MouseEvent<HTMLElement>,
    value: "new" | "existing" | null
  ) => {
    if (!value) return;

    setMode(value);

    // Reset conflicting fields when switching
    setValue("cust_id", null);
    setValue("customer_name", "");
    setValue("customer_mobile", "");
  };

  /* ---------------- RENDER ---------------- */
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, height: "100%" }}>
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={2}
      >
        <Typography fontWeight={700} color="primary">
          Customer Information
        </Typography>

        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          size="small"
          fullWidth={isMobile}
          sx={{ "& .MuiToggleButton-root": { flex: 1 } }}
        >
          <ToggleButton value="new">
            <PersonAddIcon sx={{ mr: 1, fontSize: 18 }} />
            New
          </ToggleButton>
          <ToggleButton value="existing">
            <PersonSearchIcon sx={{ mr: 1, fontSize: 18 }} />
            Existing
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Body */}
      <Grid container spacing={2}>
        {mode === "new" ? (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="customer_mobile"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Mobile Number"
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">+91</InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </>
        ) : (
          <Grid size={{ xs: 12, md: 12 }}>
            <Controller
              name="cust_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  fullWidth
                  options={MOCK_CUSTOMERS}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  getOptionLabel={(o) => `${o.name} (${o.mobile})`}
                  onChange={(_, v) => {
                    field.onChange(v?.id ?? null);

                    if (v) {
                      setValue("customer_name", v.name);
                      setValue("customer_mobile", v.mobile);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Customer"
                      fullWidth
                    />
                  )}
                />
              )}
            />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
