export const PolicyStatus = {
  RENOVADA:   'RENOVADA',
  AL_DIA:     'AL_DIA',
  POR_VENCER: 'POR_VENCER',
  CRITICO:    'CRITICO',
  EN_VENTANA: 'EN_VENTANA',
  PERDIDA:    'PERDIDA',
} as const
export type PolicyStatus = typeof PolicyStatus[keyof typeof PolicyStatus]

export const PolicyType = {
  AUTO:  'AUTO',
  HOGAR: 'HOGAR',
  VIDA:  'VIDA',
  OTRO:  'OTRO',
} as const
export type PolicyType = typeof PolicyType[keyof typeof PolicyType]

export interface Client {
  id: string
  name: string
  phone: string
  email: string | null
  createdAt: string
}

export interface Policy {
  id: string
  insurer: string
  type: PolicyType
  expirationDate: string
  isManaged: boolean
  isRenewed: boolean
  notes: string | null
  status: PolicyStatus
  daysUntilExpiry: number
  clientName: string
  clientPhone: string
  clientEmail: string | null
  createdAt: string
  updatedAt: string
}

export interface KpiData {
  alDia: number
  porVencer: number
  critico: number
  enVentana: number
  perdida: number
  total: number
}
