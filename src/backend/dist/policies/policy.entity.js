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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyEntity = exports.PolicyType = void 0;
const typeorm_1 = require("typeorm");
const client_entity_1 = require("../clients/client.entity");
var PolicyType;
(function (PolicyType) {
    PolicyType["AUTO"] = "AUTO";
    PolicyType["HOGAR"] = "HOGAR";
    PolicyType["VIDA"] = "VIDA";
    PolicyType["OTRO"] = "OTRO";
})(PolicyType || (exports.PolicyType = PolicyType = {}));
let PolicyEntity = class PolicyEntity {
    id;
    insurer;
    type;
    expirationDate;
    isManaged;
    isRenewed;
    notes;
    createdAt;
    updatedAt;
    client;
    clientId;
};
exports.PolicyEntity = PolicyEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PolicyEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PolicyEntity.prototype, "insurer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: PolicyType, default: PolicyType.AUTO }),
    __metadata("design:type", String)
], PolicyEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiration_date' }),
    __metadata("design:type", Date)
], PolicyEntity.prototype, "expirationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_managed', default: false }),
    __metadata("design:type", Boolean)
], PolicyEntity.prototype, "isManaged", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_renewed', default: false }),
    __metadata("design:type", Boolean)
], PolicyEntity.prototype, "isRenewed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PolicyEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PolicyEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PolicyEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.ClientEntity, { eager: false, onDelete: 'CASCADE' }),
    __metadata("design:type", client_entity_1.ClientEntity)
], PolicyEntity.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id' }),
    __metadata("design:type", String)
], PolicyEntity.prototype, "clientId", void 0);
exports.PolicyEntity = PolicyEntity = __decorate([
    (0, typeorm_1.Entity)('policies')
], PolicyEntity);
//# sourceMappingURL=policy.entity.js.map