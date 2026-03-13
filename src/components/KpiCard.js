import { Paper, Typography, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

const KpiCard = ({ title, value, subtitle, isCurrency = false, decimals = 0, icon = null, color = '#1976d2' }) => {
  const formatValue = (v) => {
    if (v === null || v === undefined || v === '') return '-';
    const num = Number(v);
    if (isCurrency && !Number.isNaN(num)) {
      const decimalsToUse = typeof decimals === 'number' && decimals >= 0 ? decimals : 2;
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: decimalsToUse,
          maximumFractionDigits: decimalsToUse,
        }).format(num);
      } catch (e) {
        return `€ ${num.toFixed(decimalsToUse)}`;
      }
    }
    if (!Number.isNaN(num)) return num.toLocaleString();
    return String(v);
  };

  return (
    <Paper
      sx={{
        p: 2,
        minHeight: 110,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        boxShadow: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.06)}, ${alpha(color, 0.02)})`,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(color, 0.12),
            color: color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: color }}>{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial' }}>{formatValue(value)}</Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">{subtitle}</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default KpiCard;
