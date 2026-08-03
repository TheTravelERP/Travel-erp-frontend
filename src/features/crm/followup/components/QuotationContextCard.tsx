// src/features/crm/followup/components/QuotationContextCard.tsx

import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import EntityContextBar from "../../../../components/common/EntityContextBar";
import type { QuotationDetail } from "../../quotation/quotation.types";

const STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Draft: "default", Sent: "primary", Revised: "warning",
  Accepted: "success", Rejected: "error", Expired: "error", Converted: "success",
};

interface QuotationContextCardProps {
  quotation: QuotationDetail | null;
  loading?: boolean;
}

export default function QuotationContextCard({ quotation, loading }: QuotationContextCardProps) {
  const { t } = useTranslation();

  if (loading) {
    return <EntityContextBar loading />;
  }

  if (!quotation) {
    return null;
  }

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: t("followup.contextQuotationNo"), value: quotation.quotation_no },
    { label: t("followup.contextCustomer"), value: quotation.customer_name || "-" },
    {
      label: t("followup.contextStatus"),
      value: <Chip size="small" color={STATUS_COLOR[quotation.status] ?? "default"} label={quotation.status} />,
    },
  ];

  return <EntityContextBar fields={fields} />;
}
