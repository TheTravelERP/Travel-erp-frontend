// src/features/booking/components/TravellerDocumentsPanel.tsx
//
// Traveller documents, categorized (Passport/Visa/Photograph/Air Ticket/
// Insurance/Other). No new backend or upload code needed — the generic
// Attachment system already stores every attachment's category and
// AttachmentList already lists everything for the entity regardless of
// category (category only tags new uploads). This is just a category
// picker sitting in front of the existing generic AttachmentList.
import { useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import AttachmentList from "../../../components/common/AttachmentList";

const DOCUMENT_CATEGORIES = ["Passport", "Visa", "Photograph", "Air Ticket", "Insurance", "Other"] as const;

interface Props {
  travellerUuid: string;
  canEdit: boolean;
}

export default function TravellerDocumentsPanel({ travellerUuid, canEdit }: Props) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<string>("Passport");

  return (
    <>
      <TextField
        select
        size="small"
        label={t("common.category")}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        sx={{ mb: 1.5, minWidth: 200 }}
      >
        {DOCUMENT_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
      </TextField>

      <AttachmentList
        entityType="traveller"
        entityUuid={travellerUuid}
        menuKey="packages.bookings.travellers"
        category={category}
        canEdit={canEdit}
      />
    </>
  );
}
