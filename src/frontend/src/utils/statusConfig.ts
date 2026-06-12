import { PolicyStatus } from '../types'

export const statusConfig: Record<PolicyStatus, { label: string; color: string; bgColor: string }> = {
  EN_VENTANA: { label: 'En Ventana', color: '#FF9800', bgColor: '#FFF3E0' },
  CRITICO:    { label: 'Crítico',    color: '#F44336', bgColor: '#FFEBEE' },
  POR_VENCER: { label: 'Por Vencer', color: '#FFC107', bgColor: '#FFF8E1' },
  AL_DIA:     { label: 'Al Día',     color: '#4CAF50', bgColor: '#E8F5E9' },
  RENOVADA:   { label: 'Renovada',   color: '#1565C0', bgColor: '#E3F2FD' },
  PERDIDA:    { label: 'Perdida',    color: '#9E9E9E', bgColor: '#F5F5F5' },
}
