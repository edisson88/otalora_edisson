import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyEntity } from './policy.entity';
import { UpdatePolicyDto } from './dto/update-policy.dto';

export enum PolicyStatus {
  RENOVADA = 'RENOVADA',
  AL_DIA = 'AL_DIA',
  POR_VENCER = 'POR_VENCER',
  CRITICO = 'CRITICO',
  EN_VENTANA = 'EN_VENTANA',
  PERDIDA = 'PERDIDA',
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

const STATUS_ORDER: PolicyStatus[] = [
  PolicyStatus.EN_VENTANA,
  PolicyStatus.CRITICO,
  PolicyStatus.POR_VENCER,
  PolicyStatus.AL_DIA,
  PolicyStatus.RENOVADA,
  PolicyStatus.PERDIDA,
];

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(PolicyEntity)
    private readonly policiesRepository: Repository<PolicyEntity>,
  ) {}

  private calculateStatus(
    expirationDate: Date,
    isRenewed: boolean,
  ): { status: PolicyStatus; daysUntilExpiry: number } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expirationDate);
    exp.setHours(0, 0, 0, 0);
    const diffMs = exp.getTime() - today.getTime();
    const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (isRenewed) return { status: PolicyStatus.RENOVADA, daysUntilExpiry };
    if (daysUntilExpiry > 10) return { status: PolicyStatus.AL_DIA, daysUntilExpiry };
    if (daysUntilExpiry >= 6) return { status: PolicyStatus.POR_VENCER, daysUntilExpiry };
    if (daysUntilExpiry >= 0) return { status: PolicyStatus.CRITICO, daysUntilExpiry };
    if (daysUntilExpiry >= -30) return { status: PolicyStatus.EN_VENTANA, daysUntilExpiry };
    return { status: PolicyStatus.PERDIDA, daysUntilExpiry };
  }

  private enrichPolicy(policy: PolicyEntity): PolicyWithStatus {
    const { status, daysUntilExpiry } = this.calculateStatus(
      policy.expirationDate,
      policy.isRenewed,
    );
    return Object.assign(Object.create(Object.getPrototypeOf(policy)), policy, {
      status,
      daysUntilExpiry,
      clientName: policy.client?.name ?? '',
      clientPhone: policy.client?.phone ?? '',
      clientEmail: policy.client?.email ?? null,
    }) as PolicyWithStatus;
  }

  async findAll(): Promise<PolicyWithStatus[]> {
    const policies = await this.policiesRepository.find({
      relations: { client: true },
    });
    const enriched = policies.map((p) => this.enrichPolicy(p));
    return enriched.sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    );
  }

  async getKpis(): Promise<KpiResult> {
    const policies = await this.findAll();
    return {
      alDia: policies.filter((p) => p.status === PolicyStatus.AL_DIA).length,
      porVencer: policies.filter((p) => p.status === PolicyStatus.POR_VENCER).length,
      critico: policies.filter((p) => p.status === PolicyStatus.CRITICO).length,
      enVentana: policies.filter((p) => p.status === PolicyStatus.EN_VENTANA).length,
      perdida: policies.filter((p) => p.status === PolicyStatus.PERDIDA).length,
      total: policies.length,
    };
  }

  async update(id: string, dto: UpdatePolicyDto): Promise<PolicyWithStatus> {
    const policy = await this.policiesRepository.findOne({
      where: { id },
      relations: { client: true },
    });
    if (!policy) {
      throw new NotFoundException(`Póliza con id ${id} no encontrada`);
    }
    if (dto.isRenewed === true && !policy.isManaged) {
      throw new BadRequestException(
        'Debe gestionar la póliza antes de marcarla como renovada',
      );
    }
    Object.assign(policy, dto);
    const saved = await this.policiesRepository.save(policy);
    return this.enrichPolicy(saved);
  }
}
