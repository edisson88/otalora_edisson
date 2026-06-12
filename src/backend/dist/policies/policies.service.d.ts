import { Repository } from 'typeorm';
import { PolicyEntity } from './policy.entity';
import { UpdatePolicyDto } from './dto/update-policy.dto';
export declare enum PolicyStatus {
    RENOVADA = "RENOVADA",
    AL_DIA = "AL_DIA",
    POR_VENCER = "POR_VENCER",
    CRITICO = "CRITICO",
    EN_VENTANA = "EN_VENTANA",
    PERDIDA = "PERDIDA"
}
export type PolicyWithStatus = PolicyEntity & {
    status: PolicyStatus;
    daysUntilExpiry: number;
    clientName: string;
    clientPhone: string;
    clientEmail: string | null;
};
export interface KpiResult {
    alDia: number;
    porVencer: number;
    critico: number;
    enVentana: number;
    perdida: number;
    total: number;
}
export declare class PoliciesService {
    private readonly policiesRepository;
    constructor(policiesRepository: Repository<PolicyEntity>);
    private calculateStatus;
    private enrichPolicy;
    findAll(): Promise<PolicyWithStatus[]>;
    getKpis(): Promise<KpiResult>;
    update(id: string, dto: UpdatePolicyDto): Promise<PolicyWithStatus>;
}
