// src/components/common/UserAvatar.tsx
import { Avatar, type AvatarProps } from '@mui/material';
import { resolveUploadUrl } from '../../services/upload.service';

interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'children'> {
  name?: string | null;
  email?: string | null;
  pictureUrl?: string | null;
}

function getInitials(name?: string | null, email?: string | null): string {
  const trimmedName = name?.trim();
  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email?.trim()) return email.trim()[0].toUpperCase();
  return '?';
}

export default function UserAvatar({ name, email, pictureUrl, sx, ...props }: UserAvatarProps) {
  const resolvedSrc = resolveUploadUrl(pictureUrl);

  if (resolvedSrc) {
    return <Avatar src={resolvedSrc} sx={sx} {...props} />;
  }

  return (
    <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', ...sx }} {...props}>
      {getInitials(name, email)}
    </Avatar>
  );
}
