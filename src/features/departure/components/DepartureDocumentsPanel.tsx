// src/features/departure/components/DepartureDocumentsPanel.tsx
//
// Departure documents, categorized. No new backend upload code needed
// beyond registering these exact 7 category strings in file_upload_
// service.py's UPLOAD_RULES — the generic Attachment system handles
// storage/listing. Mirrors TravellerDocumentsPanel.tsx's shape.
import { useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import AttachmentList from "../../../components/common/AttachmentList";

const DOCUMENT_CATEGORIES = [
  "Departure Circular",
  "Rooming List",
  "Passenger List",
  "Visa List",
  "Flight List",
  "Supplier Documents",
  "General Documents",
] as const;

interface Props {
  departureUuid: string;
  canEdit: boolean;
}

export default function DepartureDocumentsPanel({ departureUuid, canEdit }: Props) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<string>("Departure Circular");

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
            {t(`departure.documents.${c}`, { defaultValue: c })}
          </MenuItem>
        ))}
      </TextField>

      <AttachmentList
        entityType="departure"
        entityUuid={departureUuid}
        menuKey="packages.departures"
        category={category}
        canEdit={canEdit}
      />
    </>
  );
}
