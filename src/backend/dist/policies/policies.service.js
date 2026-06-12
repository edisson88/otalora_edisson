"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliciesService = exports.PolicyStatus = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const policy_entity_1 = require("./policy.entity");
var PolicyStatus;
(function (PolicyStatus) {
    PolicyStatus["RENOVADA"] = "RENOVADA";
    PolicyStatus["AL_DIA"] = "AL_DIA";
    PolicyStatus["POR_VENCER"] = "POR_VENCER";
    PolicyStatus["CRITICO"] = "CRITICO";
    PolicyStatus["EN_VENTANA"] = "EN_VENTANA";
    PolicyStatus["PERDIDA"] = "PERDIDA";
})(PolicyStatus || (exports.PolicyStatus = PolicyStatus = {}));
const STATUS_ORDER = [
    PolicyStatus.EN_VENTANA,
    PolicyStatus.CRITICO,
    PolicyStatus.POR_VENCER,
    PolicyStatus.AL_DIA,
    PolicyStatus.RENOVADA,
    PolicyStatus.PERDIDA,
];
let PoliciesService = class PoliciesService {
    policiesRepository;
    constructor(policiesRepository) {
        this.policiesRepository = policiesRepository;
    }
    calculateStatus(expirationDate, isRenewed) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exp = new Date(expirationDate);
        exp.setHours(0, 0, 0, 0);
        const diffMs = exp.getTime() - today.getTime();
        const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (isRenewed)
            return { status: PolicyStatus.RENOVADA, daysUntilExpiry };
        if (daysUntilExpiry > 10)
            return { status: PolicyStatus.AL_DIA, daysUntilExpiry };
        if (daysUntilExpiry >= 6)
            return { status: PolicyStatus.POR_VENCER, daysUntilExpiry };
        if (daysUntilExpiry >= 0)
            return { status: PolicyStatus.CRITICO, daysUntilExpiry };
        if (daysUntilExpiry >= -30)
            return { status: PolicyStatus.EN_VENTANA, daysUntilExpiry };
        return { status: PolicyStatus.PERDIDA, daysUntilExpiry };
    }
    enrichPolicy(policy) {
        const { status, daysUntilExpiry } = this.calculateStatus(policy.expirationDate, policy.isRenewed);
        return Object.assign(Object.create(Object.getPrototypeOf(policy)), policy, {
            status,
            daysUntilExpiry,
            clientName: policy.client?.name ?? '',
            clientPhone: policy.client?.phone ?? '',
            clientEmail: policy.client?.email ?? null,
        });
    }
    async findAll() {
        const policies = await this.policiesRepository.find({
            relations: { client: true },
        });
        const enriched = policies.map((p) => this.enrichPolicy(p));
        return enriched.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
    }
    async getKpis() {
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
    async update(id, dto) {
        const policy = await this.policiesRepository.findOne({
            where: { id },
            relations: { client: true },
        });
        if (!policy) {
            throw new common_1.NotFoundException(`Póliza con id ${id} no encontrada`);
        }
        if (dto.isRenewed === true && !policy.isManaged) {
            throw new common_1.BadRequestException('Debe gestionar la póliza antes de marcarla como renovada');
        }
        Object.assign(policy, dto);
        const saved = await this.policiesRepository.save(policy);
        return this.enrichPolicy(saved);
    }
};
exports.PoliciesService = PoliciesService;
exports.PoliciesService = PoliciesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(policy_entity_1.PolicyEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PoliciesService);
//# sourceMappingURL=policies.service.js.map