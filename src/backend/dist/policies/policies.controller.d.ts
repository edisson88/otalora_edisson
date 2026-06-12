import { PoliciesService, PolicyWithStatus, KpiResult } from './policies.service';
import { UpdatePolicyDto } from './dto/update-policy.dto';
export declare class PoliciesController {
    private readonly policiesService;
    constructor(policiesService: PoliciesService);
    findAll(): Promise<PolicyWithStatus[]>;
    getKpis(): Promise<KpiResult>;
    update(id: string, dto: UpdatePolicyDto): Promise<PolicyWithStatus>;
}
