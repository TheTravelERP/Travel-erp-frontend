// src/features/crm/quotation/components/QuotationVersionSwitcher.tsx
import { useEffect, useState } from "react";
import { Tabs, Tab, Chip, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getQuotationVersions } from "../quotation.api";
import type { QuotationVersionSummary } from "../quotation.types";

interface Props {
  currentUuid: string;
}

export default function QuotationVersionSwitcher({ currentUuid }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<QuotationVersionSummary[]>([]);

  useEffect(() => {
    getQuotationVersions(currentUuid).then(setVersions);
  }, [currentUuid]);

  if (versions.length <= 1) return null;

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
      <Tabs
        value={currentUuid}
        onChange={(_, v) => navigate(`/app/crm/quotations/${v}`)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {versions.map((v) => (
          <Tab
            key={v.uuid}
            value={v.uuid}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                {t("quotation.revision", { n: v.revision_no })}
                {v.is_current_version && <Chip size="small" color="primary" label={t("quotation.current")} />}
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}
