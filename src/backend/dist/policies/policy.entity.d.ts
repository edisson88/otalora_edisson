import { ClientEntity } from '../clients/client.entity';
export declare enum PolicyType {
    AUTO = "AUTO",
    HOGAR = "HOGAR",
    VIDA = "VIDA",
    OTRO = "OTRO"
}
export declare class PolicyEntity {
    id: string;
    insurer: string;
    type: PolicyType;
    expirationDate: Date;
    isManaged: boolean;
    isRenewed: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    client: ClientEntity;
    clientId: string;
}
