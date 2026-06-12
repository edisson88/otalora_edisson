"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../users/user.entity");
const client_entity_1 = require("../clients/client.entity");
const policy_entity_1 = require("../policies/policy.entity");
function addDays(base, days) {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
}
async function main() {
    const dataSource = new typeorm_1.DataSource({
        type: 'better-sqlite3',
        database: './agentemotor.db',
        entities: [user_entity_1.UserEntity, client_entity_1.ClientEntity, policy_entity_1.PolicyEntity],
        synchronize: true,
        logging: false,
    });
    await dataSource.initialize();
    await dataSource.getRepository(policy_entity_1.PolicyEntity).clear();
    await dataSource.getRepository(client_entity_1.ClientEntity).clear();
    await dataSource.getRepository(user_entity_1.UserEntity).clear();
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = dataSource.getRepository(user_entity_1.UserEntity).create({
        email: 'maria@agentemotor.com',
        password: hashedPassword,
        name: 'María González',
    });
    await dataSource.getRepository(user_entity_1.UserEntity).save(user);
    const clientsData = [
        { name: 'Carlos Rodríguez', phone: '3101234567', email: 'carlos.rodriguez@gmail.com' },
        { name: 'Ana Martínez', phone: '3152345678', email: 'ana.martinez@hotmail.com' },
        { name: 'Luis Pérez', phone: '3003456789', email: 'luis.perez@gmail.com' },
        { name: 'Sandra Gómez', phone: '3124567890', email: 'sandra.gomez@yahoo.com' },
        { name: 'Jorge Hernández', phone: '3185678901', email: undefined },
        { name: 'Patricia Torres', phone: '3206789012', email: 'patricia.torres@gmail.com' },
        { name: 'Andrés Vargas', phone: '3017890123', email: 'andres.vargas@outlook.com' },
        { name: 'Claudia Moreno', phone: '3138901234', email: undefined },
        { name: 'Ricardo Jiménez', phone: '3169012345', email: 'ricardo.jimenez@gmail.com' },
        { name: 'Marcela Ruiz', phone: '3220123456', email: 'marcela.ruiz@hotmail.com' },
        { name: 'Sebastián Castro', phone: '3101234568', email: undefined },
        { name: 'Liliana Rojas', phone: '3152345679', email: 'liliana.rojas@gmail.com' },
        { name: 'Fernando Díaz', phone: '3003456780', email: 'fernando.diaz@gmail.com' },
        { name: 'Natalia Medina', phone: '3124567891', email: 'natalia.medina@yahoo.com' },
        { name: 'Camilo Suárez', phone: '3185678902', email: undefined },
    ];
    const clients = await dataSource.getRepository(client_entity_1.ClientEntity).save(clientsData.map((c) => dataSource.getRepository(client_entity_1.ClientEntity).create(c)));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const policiesData = [
        {
            insurer: 'SURA',
            type: policy_entity_1.PolicyType.AUTO,
            expirationDate: addDays(today, 30),
            isManaged: false,
            isRenewed: false,
            client: clients[0],
            clientId: clients[0].id,
        },
        {
            insurer: 'Bolívar',
            type: policy_entity_1.PolicyType.HOGAR,
            expirationDate: addDays(today, 45),
            isManaged: false,
            isRenewed: false,
            client: clients[1],
            clientId: clients[1].id,
        },
        {
            insurer: 'Allianz',
            type: policy_entity_1.PolicyType.VIDA,
            expirationDate: addDays(today, 60),
            isManaged: false,
            isRenewed: false,
            client: clients[2],
            clientId: clients[2].id,
        },
        {
            insurer: 'Mapfre',
            type: policy_entity_1.PolicyType.AUTO,
            expirationDate: addDays(today, 7),
            isManaged: false,
            isRenewed: false,
            client: clients[3],
            clientId: clients[3].id,
        },
        {
            insurer: 'AXA',
            type: policy_entity_1.PolicyType.HOGAR,
            expirationDate: addDays(today, 8),
            isManaged: false,
            isRenewed: false,
            client: clients[4],
            clientId: clients[4].id,
        },
        {
            insurer: 'SURA',
            type: policy_entity_1.PolicyType.OTRO,
            expirationDate: addDays(today, 9),
            isManaged: false,
            isRenewed: false,
            client: clients[5],
            clientId: clients[5].id,
        },
        {
            insurer: 'Bolívar',
            type: policy_entity_1.PolicyType.AUTO,
            expirationDate: addDays(today, 1),
            isManaged: true,
            isRenewed: false,
            notes: 'Llamé el lunes, cliente interesado en renovar con Bolívar',
            client: clients[6],
            clientId: clients[6].id,
        },
        {
            insurer: 'Allianz',
            type: policy_entity_1.PolicyType.VIDA,
            expirationDate: addDays(today, 2),
            isManaged: false,
            isRenewed: false,
            client: clients[7],
            clientId: clients[7].id,
        },
        {
            insurer: 'Mapfre',
            type: policy_entity_1.PolicyType.AUTO,
            expirationDate: addDays(today, 4),
            isManaged: true,
            isRenewed: false,
            notes: 'Cliente pidió cotización, enviada por WhatsApp',
            client: clients[8],
            clientId: clients[8].id,
        },
        {
            insurer: 'AXA',
            type: policy_entity_1.PolicyType.HOGAR,
            expirationDate: addDays(today, -5),
            isManaged: true,
            isRenewed: false,
            notes: 'Llamé el viernes, cliente evaluando opciones con SURA y AXA',
            client: clients[9],
            clientId: clients[9].id,
        },
        {
            insurer: 'SURA',
            type: policy_entity_1.PolicyType.AUTO,
            expirationDate: addDays(today, -10),
            isManaged: false,
            isRenewed: false,
            client: clients[10],
            clientId: clients[10].id,
        },
        {
            insurer: 'Bolívar',
            type: policy_entity_1.PolicyType.OTRO,
            expirationDate: addDays(today, -20),
            isManaged: true,
            isRenewed: false,
            notes: 'Segunda llamada, espera respuesta del cliente esta semana',
            client: clients[11],
            clientId: clients[11].id,
        },
        {
            insurer: 'Allianz',
            type: policy_entity_1.PolicyType.VIDA,
            expirationDate: addDays(today, -28),
            isManaged: false,
            isRenewed: false,
            client: clients[12],
            clientId: clients[12].id,
        },
        {
            insurer: 'Mapfre',
            type: policy_entity_1.PolicyType.AUTO,
            expirationDate: addDays(today, -35),
            isManaged: false,
            isRenewed: false,
            client: clients[13],
            clientId: clients[13].id,
        },
        {
            insurer: 'AXA',
            type: policy_entity_1.PolicyType.HOGAR,
            expirationDate: addDays(today, -45),
            isManaged: false,
            isRenewed: false,
            client: clients[14],
            clientId: clients[14].id,
        },
        {
            insurer: 'SURA',
            type: policy_entity_1.PolicyType.AUTO,
            expirationDate: addDays(today, -15),
            isManaged: true,
            isRenewed: true,
            notes: 'Renovada exitosamente con SURA, nueva póliza emitida',
            client: clients[0],
            clientId: clients[0].id,
        },
    ];
    await dataSource.getRepository(policy_entity_1.PolicyEntity).save(policiesData.map((p) => dataSource.getRepository(policy_entity_1.PolicyEntity).create(p)));
    await dataSource.destroy();
    console.log(`✅ Seed completado:
 - 1 usuario creado
 - 15 clientes creados
 - 16 pólizas creadas`);
}
main().catch((err) => {
    console.error('❌ Error en el seed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map