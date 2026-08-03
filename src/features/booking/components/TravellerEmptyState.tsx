// src/features/booking/components/TravellerEmptyState.tsx
import { Box, Button, Stack, Typography } from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

interface Props {
  canCreate: boolean;
  onAddTraveller: () => void;
  onAddCustomerAsTraveller: () => void;
}

export default function TravellerEmptyState({ canCreate, onAddTraveller, onAddCustomerAsTraveller }: Props) {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} px={2} textAlign="center">
      <GroupAddIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {t("booking.noTravellersYet", "No travellers have been added to this booking yet.")}
      </Typography>
      {canCreate && (
        <Stack direction="row" spacing={1.5} mt={2}>
          <Button variant="outlined" startIcon={<PersonAddIcon />} onClick={onAddCustomerAsTraveller}>
            {t("booking.addCustomerAsTraveller", "Add Customer as Traveller")}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddTraveller}>
            {t("booking.addTraveller")}
          </Button>
        </Stack>
      )}
    </Box>
  );
}
