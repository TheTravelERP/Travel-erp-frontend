// src/features/settings/eventAutomation/components/EventAutomationTable.tsx

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Switch,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { EventRuleItem } from "../eventAutomation.types";

interface Props {
  rows: EventRuleItem[];
  onToggleActive: (event: EventRuleItem, active: boolean) => void;
  onConfigure: (event: EventRuleItem) => void;
}

export default function EventAutomationTable({ rows, onToggleActive, onConfigure }: Props) {
  const { t } = useTranslation();

  const channelChips = (row: EventRuleItem) => (
    <Stack direction="row" spacing={0.5}>
      {row.email_enabled && <Chip size="small" label={t("communicationProvider.categoryEmail")} />}
      {row.whatsapp_enabled && <Chip size="small" label={t("communicationProvider.categoryWhatsapp")} />}
      {row.sms_enabled && <Chip size="small" label={t("communicationProvider.categorySms")} />}
      {!row.email_enabled && !row.whatsapp_enabled && !row.sms_enabled && (
        <Typography variant="caption" color="text.secondary">
          {t("eventAutomation.noChannelsEnabled")}
        </Typography>
      )}
    </Stack>
  );

  return (
    <TableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>{t("eventAutomation.colEvent")}</TableCell>
            <TableCell>{t("eventAutomation.colModule")}</TableCell>
            <TableCell>{t("eventAutomation.colChannels")}</TableCell>
            <TableCell>{t("eventAutomation.colTrigger")}</TableCell>
            <TableCell>{t("common.active")}</TableCell>
            <TableCell align="right">{t("common.actions")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.event_code} hover>
              <TableCell>
                <Typography fontWeight={600}>{row.event_name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.event_code}
                </Typography>
              </TableCell>
              <TableCell>{row.module_group}</TableCell>
              <TableCell>{channelChips(row)}</TableCell>
              <TableCell>{t(`eventAutomation.triggerType.${row.trigger_type}`)}</TableCell>
              <TableCell>
                <Switch checked={row.is_active} onChange={(e) => onToggleActive(row, e.target.checked)} />
              </TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => onConfigure(row)}>
                  {t("eventAutomation.configure")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Box textAlign="center" py={5}>
                  <Typography>{t("common.noRecordsFound")}</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
