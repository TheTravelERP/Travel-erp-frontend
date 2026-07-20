// src/components/common/ComingSoonPage.tsx
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ComingSoonPageProps {
  titleKey: string;
}

export default function ComingSoonPage({ titleKey }: ComingSoonPageProps) {
  const { t } = useTranslation();
  const title = t(titleKey);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t('menu.dashboard')}
        </Link>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 10,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <ConstructionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
          {t('common.comingSoon')}
        </Typography>
      </Box>
    </Box>
  );
}
