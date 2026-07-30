// src/features/settings/eventAutomation/components/ConditionsBuilder.tsx

import { Box, Button, Grid, IconButton, MenuItem, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import type { ConditionItem, ConditionOperator } from "../eventAutomation.types";

interface Props {
  value: ConditionItem[];
  onChange: (value: ConditionItem[]) => void;
}

const OPERATORS: ConditionOperator[] = ["eq", "neq", "in"];

export default function ConditionsBuilder({ value, onChange }: Props) {
  const { t } = useTranslation();

  function update(index: number, patch: Partial<ConditionItem>) {
    onChange(value.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function add() {
    onChange([...value, { field: "", operator: "eq", value: "" }]);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t("eventAutomation.conditions")}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        {t("eventAutomation.conditionsHelper")}
      </Typography>

      {value.map((condition, i) => (
        <Grid container spacing={1} key={i} sx={{ mb: 1 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label={t("eventAutomation.field")}
              placeholder="priority"
              value={condition.field}
              onChange={(e) => update(i, { field: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              select
              fullWidth
              label={t("eventAutomation.operator")}
              value={condition.operator}
              onChange={(e) => update(i, { operator: e.target.value as ConditionOperator })}
            >
              {OPERATORS.map((op) => (
                <MenuItem key={op} value={op}>
                  {t(`eventAutomation.operator${op}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              label={t("eventAutomation.value")}
              placeholder="High"
              value={condition.value ?? ""}
              onChange={(e) => update(i, { value: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 1 }}>
            <IconButton size="small" color="error" onClick={() => remove(i)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Button size="small" startIcon={<AddIcon />} onClick={add}>
        {t("eventAutomation.addCondition")}
      </Button>
    </Box>
  );
}
