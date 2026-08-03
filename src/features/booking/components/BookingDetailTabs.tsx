// src/features/booking/components/BookingDetailTabs.tsx
//
// First tabbed detail-page layout in the codebase — every existing entity
// detail page (Quotation/Enquiry/Customer) stacks Paper sections on one
// scrolling page instead. Booking needs it because its detail page has ~7
// sections (Summary, Travellers, Services, Documents, Communication,
// Timeline, Attachments, Audit); kept generic ({label, content}[]) so other
// modules can adopt it later instead of duplicating a Booking-specific shell.
import { useState, type ReactNode } from "react";
import { Box, Paper, Tab, Tabs } from "@mui/material";

export interface BookingDetailTab {
  key: string;
  label: string;
  content: ReactNode;
}

interface Props {
  tabs: BookingDetailTab[];
}

export default function BookingDetailTabs({ tabs }: Props) {
  const [active, setActive] = useState(0);

  return (
    <Paper sx={{ mb: 2 }}>
      <Tabs
        value={active}
        onChange={(_, value) => setActive(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} label={tab.label} />
        ))}
      </Tabs>
      <Box sx={{ p: 2 }}>
        {tabs[active]?.content}
      </Box>
    </Paper>
  );
}
