export const ActiveStatus = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const;

export type ActiveStatus =
  (typeof ActiveStatus)[keyof typeof ActiveStatus];
