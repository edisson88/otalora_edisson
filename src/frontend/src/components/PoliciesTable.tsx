import { useState } from 'react'
import {
  Box,
  Chip,
  InputAdornment,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import InboxIcon from '@mui/icons-material/Inbox'
import type { Policy } from '../types'
import { PolicyStatus } from '../types'
import { statusConfig } from '../utils/statusConfig'

interface PoliciesTableProps {
  policies: Policy[]
  selectedFilter: PolicyStatus | 'ALL'
  onUpdatePolicy: (id: string, data: { isManaged?: boolean; isRenewed?: boolean; notes?: string }) => Promise<void>
}

function formatExpiry(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  const formatted = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(date)

  if (days > 0) return `${formatted} (faltan ${days} días)`
  if (days === 0) return `${formatted} (vence hoy)`
  return `${formatted} (vencida hace ${Math.abs(days)} días)`
}

export default function PoliciesTable({ policies, selectedFilter, onUpdatePolicy }: PoliciesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})

  const filtered = policies
    .filter((p) => selectedFilter === 'ALL' || p.status === selectedFilter)
    .filter((p) => p.clientName.toLowerCase().includes(searchTerm.toLowerCase()))

  const getNoteValue = (policy: Policy) =>
    notesDraft[policy.id] !== undefined ? notesDraft[policy.id] : (policy.notes ?? '')

  const handleNoteBlur = (policy: Policy) => {
    const draft = notesDraft[policy.id]
    if (draft !== undefined && draft !== (policy.notes ?? '')) {
      onUpdatePolicy(policy.id, { notes: draft })
    }
  }

  const isUrgentUnmanaged = (p: Policy) =>
    (p.status === PolicyStatus.EN_VENTANA || p.status === PolicyStatus.CRITICO) && !p.isManaged

  return (
    <Box>
      <TextField
        placeholder="Buscar cliente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <InboxIcon sx={{ fontSize: 48, mb: 1, display: 'block', mx: 'auto' }} />
          <Typography>No hay pólizas para mostrar</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Cliente</TableCell>
                <TableCell>Aseguradora</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Gestionado</TableCell>
                <TableCell align="center">Renovado</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Notas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((policy) => {
                const cfg = statusConfig[policy.status]
                return (
                  <TableRow
                    key={policy.id}
                    sx={{
                      bgcolor: policy.isRenewed
                        ? statusConfig.RENOVADA.bgColor
                        : undefined,
                      borderLeft: isUrgentUnmanaged(policy)
                        ? '3px solid #F44336'
                        : undefined,
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {policy.clientName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {policy.clientPhone}
                      </Typography>
                    </TableCell>

                    <TableCell>{policy.insurer}</TableCell>

                    <TableCell>
                      <Chip label={policy.type} size="small" variant="outlined" />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatExpiry(policy.expirationDate, policy.daysUntilExpiry)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={cfg.label}
                        size="small"
                        sx={{
                          color: cfg.color,
                          bgcolor: cfg.bgColor,
                          fontWeight: 600,
                          border: `1px solid ${cfg.color}40`,
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Switch
                        checked={policy.isManaged}
                        size="small"
                        onChange={() => onUpdatePolicy(policy.id, { isManaged: !policy.isManaged })}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip
                        title={!policy.isManaged ? 'Gestione la póliza primero' : ''}
                        placement="top"
                      >
                        <span>
                          <Switch
                            checked={policy.isRenewed}
                            size="small"
                            disabled={!policy.isManaged}
                            onChange={() => onUpdatePolicy(policy.id, { isRenewed: !policy.isRenewed })}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <TextField
                        multiline
                        size="small"
                        fullWidth
                        minRows={1}
                        maxRows={3}
                        value={getNoteValue(policy)}
                        onChange={(e) =>
                          setNotesDraft((prev) => ({ ...prev, [policy.id]: e.target.value }))
                        }
                        onBlur={() => handleNoteBlur(policy)}
                        placeholder="Agregar nota..."
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
