// src/features/enquiry/components/EnquiryForm.tsx

import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Paper,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import GroupIcon from "@mui/icons-material/Group";
import { getEnquirySchema } from "../enquiry.schema";
import type { z } from "zod";
import CustomerSelector from "../../customer/components/CustomerSelector";
import PackageSelector from "../../package/components/PackageSelector";

export type EnquiryFormInput = z.infer<ReturnType<typeof getEnquirySchema>>;

import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import { useNavigate } from "react-router-dom";

interface EnquiryFormProps {
  defaultValues?: Partial<EnquiryFormInput>;
  onSubmit: (data: EnquiryFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  cust_id: null,
  customer_name: "",
  customer_mobile: "",
  customer_email: "",
  pkg_id: null,
  package_name: "",
  lead_source: "",
  pax_count: 1,
  enquiry_priority: "",
  conversion_status: "Pending",
  description: "",
};

export default function EnquiryForm({
  defaultValues,
  onSubmit,
  loading = false,
}: EnquiryFormProps) {
  const { t } = useTranslation();
  const enquirySchema = useMemo(() => getEnquirySchema(t), [t]);

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
      ...emptyValues,
      ...defaultValues,
    },
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...emptyValues,
        ...defaultValues,
      });
    }
  }, [defaultValues, reset]);

  /* ---------------- RENDER ---------------- */
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ flexGrow: 1 }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CustomerSelector control={control} setValue={setValue} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <PackageSelector control={control} setValue={setValue} />
        </Grid>

        {/* ENQUIRY DETAILS */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t("enquiry.enquiryDetails")}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Controller
                  name="pax_count"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t("enquiry.paxCount")}
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

              <Grid size={{ xs: 12, sm: 3 }}>
                <DropdownAutocomplete
                  name="lead_source"
                  label={t("common.source")}
                  control={control}
                  useForm={true}
                  allowAdd={true}
                  pagination
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <DropdownAutocomplete
                  name="enquiry_priority"
                  label={t("common.priority")}
                  control={control}
                  useForm={true}
                  allowAdd={false}
                  pagination
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("common.notes")}
                      multiline
                      rows={2}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ================= ROW 3: ACTIONS ================= */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => navigate("/app/enquiries")}>
              {t("common.back")}
            </Button>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => reset()}
                size="large"
              >
                {t("common.discard")}
              </Button>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? t("common.saving") : t("common.save")}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
