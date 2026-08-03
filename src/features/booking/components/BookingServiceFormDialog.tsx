// src/features/booking/components/BookingServiceFormDialog.tsx
import {
  Accordion, AccordionDetails, AccordionSummary,
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  BOOKING_SERVICE_STATUSES, BOOKING_SERVICE_TYPES,
  type BookingServiceLineDetail, type BookingServiceLineFormInput,
} from "../bookingService.types";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import AttachmentList from "../../../components/common/AttachmentList";
import CommunicationHistory from "../../../components/common/CommunicationHistory";
import ActivityTimeline from "../../../components/common/ActivityTimeline";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";

interface Props {
  open: boolean;
  line?: BookingServiceLineDetail | null;
  canEdit: boolean;
  onClose: () => void;
  onSubmit: (data: BookingServiceLineFormInput) => Promise<void>;
}

const emptyValues: BookingServiceLineFormInput = {
  service_type: "Hotel",
  vendor_uuid: null,
  supplier_reference: "",
  description: "",
  travel_date: "",
  start_date: "",
  end_date: "",
  quantity: 1,
  unit: "",
  cost_price: 0,
  selling_price: 0,
  discount_percent: 0,
  status: "Pending",
  confirmation_number: "",
  voucher_number: "",
  remarks: "",
  type_details: {},
};

export default function BookingServiceFormDialog({ open, line, canEdit, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<BookingServiceLineFormInput>({
    defaultValues: mergeFormDefaults(emptyValues, line ?? undefined),
  });

  useEffect(() => {
    if (open) reset(mergeFormDefaults(emptyValues, line ?? undefined));
  }, [open, line, reset]);

  const serviceType = useWatch({ control, name: "service_type" });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{line ? t("common.edit") : t("booking.addService")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="service_type" control={control} render={({ field }) => (
              <TextField {...field} select label={t("quotation.serviceType")} fullWidth>
                {BOOKING_SERVICE_TYPES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} label={t("quotation.description")} fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <EntityAutocomplete name="vendor_uuid" label={t("booking.supplier")} control={control} dropdownName="vendors" />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="supplier_reference" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.supplierReference")} fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="confirmation_number" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.confirmationNumber")} fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="voucher_number" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.voucherNumber")} fullWidth />
            )} />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="travel_date" control={control} render={({ field }) => (
              <TextField {...field} type="date" label={t("booking.travelDate")} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="start_date" control={control} render={({ field }) => (
              <TextField {...field} type="date" label={t("booking.startDate")} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="end_date" control={control} render={({ field }) => (
              <TextField {...field} type="date" label={t("booking.endDate")} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            )} />
          </Grid>

          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Controller name="quantity" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("quotation.quantity")} fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Controller name="unit" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.unit")} fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Controller name="cost_price" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("quotation.costPrice")} fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Controller name="selling_price" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("quotation.sellingPrice")} fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Controller name="discount_percent" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("quotation.discountPercent")} fullWidth />
            )} />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="status" control={control} render={({ field }) => (
              <TextField {...field} select label={t("common.status")} fullWidth>
                {BOOKING_SERVICE_STATUSES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller name="remarks" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.remarks")} fullWidth />
            )} />
          </Grid>

          {serviceType === "Hotel" && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="type_details.hotel_name" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.hotelName")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="type_details.room_type" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.roomType")} fullWidth />
                )} />
              </Grid>
            </>
          )}

          {serviceType === "Flight" && (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.airline" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.airline")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.flight_number" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.flightNumber")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.pnr" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.pnr")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.ticket_number" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.ticketNumber")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.seat" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.seat")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.meal" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.mealPreference")} fullWidth />
                )} />
              </Grid>
            </>
          )}

          {serviceType === "Visa" && (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.visa_number" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.visaNumber")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.embassy" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.embassy")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.visa_status" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.visaStatus")} fullWidth />
                )} />
              </Grid>
            </>
          )}

          {serviceType === "Transport" && (
            <>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="type_details.vehicle" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.vehicle")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="type_details.driver" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.driver")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="type_details.pickup_location" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.pickupLocation")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="type_details.drop_location" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.dropLocation")} fullWidth />
                )} />
              </Grid>
            </>
          )}

          {serviceType === "Insurance" && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="type_details.provider" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.insuranceProvider")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="type_details.policy_number" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.policyNumber")} fullWidth />
                )} />
              </Grid>
            </>
          )}

          {serviceType === "Guide" && (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.guide_name" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.guideName")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.contact" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.guideContact")} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type_details.language" control={control} render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} label={t("booking.language")} fullWidth />
                )} />
              </Grid>
            </>
          )}

          {serviceType === "Activity" && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="type_details.activity_name" control={control} render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} label={t("booking.activityName")} fullWidth />
              )} />
            </Grid>
          )}
        </Grid>

        {line && (
          <>
            <Accordion sx={{ mt: 2 }} defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{t("common.attachments")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <AttachmentList
                  entityType="booking_service"
                  entityUuid={line.uuid}
                  menuKey="packages.bookings"
                  canEdit={canEdit}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mt: 1 }} defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{t("communicationHistory.title", { defaultValue: "Communication History" })}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CommunicationHistory entityType="booking_service" entityUuid={line.uuid} />
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mt: 1 }} defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{t("common.activity")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ActivityTimeline entityType="booking_service" entityUuid={line.uuid} />
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button variant="contained" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
