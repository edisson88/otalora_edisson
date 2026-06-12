import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Snackbar,
  Toolbar,
  Typography,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import KpiCard from '../components/KpiCard'
import PoliciesTable from '../components/PoliciesTable'
import { getKpis, getPolicies, updatePolicy } from '../services/api'
import { PolicyStatus } from '../types'
import type { KpiData, Policy } from '../types'

type FilterValue = PolicyStatus | 'ALL'

interface SnackState {
  open: boolean
  message: string
  severity: 'success' | 'error'
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>('ALL')
  const [snack, setSnack] = useState<SnackState>({ open: false, message: '', severity: 'success' })
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getKpis(), getPolicies()])
      .then(([kpisRes, policiesRes]) => {
        setKpis(kpisRes.data)
        setPolicies(policiesRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleFilterToggle = (status: PolicyStatus) => {
    setSelectedFilter((prev) => (prev === status ? 'ALL' : status))
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  const handleUpdatePolicy = async (
    id: string,
    data: { isManaged?: boolean; isRenewed?: boolean; notes?: string },
  ) => {
    try {
      const res = await updatePolicy(id, data)
      setPolicies((prev) => prev.map((p) => (p.id === id ? res.data : p)))
      const kpisRes = await getKpis()
      setKpis(kpisRes.data)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al actualizar la póliza'
      setSnack({ open: true, message, severity: 'error' })
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const cards = [
    {
      title: 'En Ventana',
      value: kpis?.enVentana ?? 0,
      color: '#FF9800',
      icon: <WarningAmberIcon sx={{ fontSize: 32 }} />,
      status: PolicyStatus.EN_VENTANA,
    },
    {
      title: 'Crítico',
      value: kpis?.critico ?? 0,
      color: '#F44336',
      icon: <ErrorOutlineIcon sx={{ fontSize: 32 }} />,
      status: PolicyStatus.CRITICO,
    },
    {
      title: 'Por Vencer',
      value: kpis?.porVencer ?? 0,
      color: '#FFC107',
      icon: <ScheduleIcon sx={{ fontSize: 32 }} />,
      status: PolicyStatus.POR_VENCER,
    },
    {
      title: 'Al Día',
      value: kpis?.alDia ?? 0,
      color: '#4CAF50',
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />,
      status: PolicyStatus.AL_DIA,
    },
    {
      title: 'Perdidas',
      value: kpis?.perdida ?? 0,
      color: '#9E9E9E',
      icon: <CancelOutlinedIcon sx={{ fontSize: 32 }} />,
      status: PolicyStatus.PERDIDA,
    },
  ]

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Agentemotor
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={card.status}>
              <KpiCard
                title={card.title}
                value={card.value}
                color={card.color}
                icon={card.icon}
                isActive={selectedFilter === card.status}
                onClick={() => handleFilterToggle(card.status)}
              />
            </Grid>
          ))}
        </Grid>

        <PoliciesTable
          policies={policies}
          selectedFilter={selectedFilter}
          onUpdatePolicy={handleUpdatePolicy}
        />
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  )
}
