import { Card, CardContent, Typography } from '@mui/material'

interface KpiCardProps {
  title: string
  value: number
  color: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}

export default function KpiCard({ title, value, color, icon, isActive, onClick }: KpiCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderLeft: `4px solid ${color}`,
        backgroundColor: isActive ? `${color}14` : 'background.paper',
        boxShadow: isActive
          ? `0 4px 20px 0 ${color}40`
          : undefined,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <div style={{ color, fontSize: 32, lineHeight: 1, marginBottom: 8 }}>
          {icon}
        </div>
        <Typography variant="h4">{value}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  )
}
