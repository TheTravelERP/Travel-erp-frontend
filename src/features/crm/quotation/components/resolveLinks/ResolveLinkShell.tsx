// src/features/crm/quotation/components/resolveLinks/ResolveLinkShell.tsx
//
// Generic, entity-agnostic presentational shell for a single "Quotation
// Readiness" checklist item — knows nothing about Customer or Package.
// Pending state: title + a "Not Linked" status chip + a plain-language
// message explaining what's needed, then two toggle buttons ("Link
// Existing" / "Create New") that expand one of two Collapse panels
// supplied by the caller. Resolved state: a compact success card (icon +
// title + resolved name + caption), no wasted vertical space. Reuses the
// same Collapse-driven expand/collapse idiom already used everywhere else
// in the app for filter panels.

import { useState, type ReactNode } from "react";
import { Box, Button, Chip, Collapse, Grid, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";

export interface ResolveLinkSnapshotField {
  label: string;
  value: string;
}

interface ResolveLinkShellProps {
  title: string;
  statusLabel: string;
  pendingMessage: ReactNode;
  snapshotFields: ResolveLinkSnapshotField[];
  resolved: boolean;
  resolvedName?: string;
  resolvedCaption?: string;
  disabled?: boolean;
  linkExisting: ReactNode;
  createNew: ReactNode;
}

export default function ResolveLinkShell({
  title,
  statusLabel,
  pendingMessage,
  snapshotFields,
  resolved,
  resolvedName,
  resolvedCaption,
  disabled,
  linkExisting,
  createNew,
}: ResolveLinkShellProps) {
  const { t } = useTranslation();
  const [expandedPanel, setExpandedPanel] = useState<"none" | "link" | "create">("none");

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Box
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: resolved ? "success.main" : "divider",
          borderRadius: 2,
          bgcolor: resolved ? "success.50" : "background.paper",
        }}
      >
        {resolved ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleIcon color="success" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
                {title}
              </Typography>
              <Typography variant="body1" fontWeight={600} lineHeight={1.3}>
                {resolvedName}
              </Typography>
              <Typography variant="caption" color="success.dark">
                {resolvedCaption}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                {title}
              </Typography>
              <Chip label={statusLabel} size="small" color="warning" variant="outlined" />
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={1.5}>
              {pendingMessage}
            </Typography>

            {snapshotFields.length > 0 && (
              <Stack spacing={0.25} mb={1.5}>
                {snapshotFields.map((f) => (
                  <Typography key={f.label} variant="body2" color="text.secondary">
                    <strong>{f.label}:</strong> {f.value || "-"}
                  </Typography>
                ))}
              </Stack>
            )}

            <Stack direction="row" spacing={1} mb={1}>
              <Button
                size="small"
                variant={expandedPanel === "link" ? "contained" : "outlined"}
                disabled={disabled}
                onClick={() => setExpandedPanel((p) => (p === "link" ? "none" : "link"))}
              >
                {t("quotation.linkExisting")}
              </Button>
              <Button
                size="small"
                variant={expandedPanel === "create" ? "contained" : "outlined"}
                disabled={disabled}
                onClick={() => setExpandedPanel((p) => (p === "create" ? "none" : "create"))}
              >
                {t("quotation.createNew")}
              </Button>
            </Stack>

            <Collapse in={expandedPanel === "link"}>
              <Box pt={1}>{linkExisting}</Box>
            </Collapse>
            <Collapse in={expandedPanel === "create"}>
              <Box pt={1}>{createNew}</Box>
            </Collapse>
          </>
        )}
      </Box>
    </Grid>
  );
}
