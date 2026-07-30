// src/components/common/CollapsibleCard.tsx
import type { ReactNode } from "react";
import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface CollapsibleCardProps {
  title: string;
  /** Extra content rendered next to the title (e.g. a status Chip). */
  titleAdornment?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
}

/** Drop-in collapsible sibling to FormSection — same title/children shape,
 * for forms with enough sections that keeping them all permanently open
 * (the FormSection default) would make the page unusably long. */
export default function CollapsibleCard({
  title,
  titleAdornment,
  children,
  defaultExpanded = false,
}: CollapsibleCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Grid size={{ xs: 12 }}>
      <Accordion
        variant="outlined"
        expanded={expanded}
        onChange={(_, isExpanded) => setExpanded(isExpanded)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            variant="h6"
            color="primary"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {title}
            {titleAdornment}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={2}>
            {children}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}
