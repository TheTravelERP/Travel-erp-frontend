// src/features/inventory/vendor/components/VendorDocumentsPanel.tsx
//
// Supplier/Vendor documents, categorized. No new backend upload code
// needed beyond registering these exact category strings in
// file_upload_service.py's UPLOAD_RULES["vendor"] — the generic
// Attachment system (entity_type/entity_id) handles storage/listing.
// Mirrors DepartureDocumentsPanel.tsx's shape.
import { useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import AttachmentList from "../../../../components/common/AttachmentList";

const DOCUMENT_CATEGORIES = [
  "Registration Certificate",
  "GST Certificate",
  "PAN Document",
  "Agreement",
  "Other",
] as const;

interface Props {
  vendorUuid: string;
  canEdit: boolean;
}

export default function VendorDocumentsPanel({ vendorUuid, canEdit }: Props) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<string>("Registration Certificate");

  return (
    <>
      <TextField
        select
        size="small"
        label={t("common.category")}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        sx={{ mb: 1.5, minWidth: 220 }}
      >
        {DOCUMENT_CATEGORIES.map((c) => (
          <MenuItem key={c} value={c}>
            {t(`vendor.documents.${c}`, { defaultValue: c })}
          </MenuItem>
        ))}
      </TextField>

      <AttachmentList
        entityType="vendor"
        entityUuid={vendorUuid}
        menuKey="inventory.vendor_master"
        category={category}
        canEdit={canEdit}
      />
    </>
  );
}
