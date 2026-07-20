// src/components/common/SortableTableCell.tsx
import { TableCell, TableSortLabel } from "@mui/material";

interface Props {
  id: string;
  label: React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  minWidth?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (id: string) => void;
}

export default function SortableTableCell({
  id,
  label,
  sortable,
  align,
  minWidth,
  sortBy,
  sortOrder,
  onSort,
}: Props) {
  if (!sortable || !onSort) {
    return (
      <TableCell align={align} sx={{ minWidth }}>
        {label}
      </TableCell>
    );
  }

  const active = sortBy === id;

  return (
    <TableCell align={align} sx={{ minWidth }} sortDirection={active ? sortOrder : false}>
      <TableSortLabel
        active={active}
        direction={active ? sortOrder : "asc"}
        onClick={() => onSort(id)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}
