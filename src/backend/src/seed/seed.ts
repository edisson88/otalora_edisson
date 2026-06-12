import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../users/user.entity';
import { ClientEntity } from '../clients/client.entity';
import { PolicyEntity, PolicyType } from '../policies/policy.entity';

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: './agentemotor.db',
    entities: [UserEntity, ClientEntity, PolicyEntity],
    synchronize: true,
    logging: false,
  });

  await dataSource.initialize();

  // Limpiar tablas respetando FK constraints
  await dataSource.getRepository(PolicyEntity).clear();
  await dataSource.getRepository(ClientEntity).clear();
  await dataSource.getRepository(UserEntity).clear();

  // ── Usuario ───────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = dataSource.getRepository(UserEntity).create({
    email: 'maria@agentemotor.com',
    password: hashedPassword,
    name: 'María González',
  });
  await dataSource.getRepository(UserEntity).save(user);

  // ── Clientes ──────────────────────────────────────────────
  const clientsData = [
    { name: 'Carlos Rodríguez', phone: '3101234567', email: 'carlos.rodriguez@gmail.com' },
    { name: 'Ana Martínez',     phone: '3152345678', email: 'ana.martinez@hotmail.com' },
    { name: 'Luis Pérez',       phone: '3003456789', email: 'luis.perez@gmail.com' },
    { name: 'Sandra Gómez',     phone: '3124567890', email: 'sandra.gomez@yahoo.com' },
    { name: 'Jorge Hernández',  phone: '3185678901', email: undefined },
    { name: 'Patricia Torres',  phone: '3206789012', email: 'patricia.torres@gmail.com' },
    { name: 'Andrés Vargas',    phone: '3017890123', email: 'andres.vargas@outlook.com' },
    { name: 'Claudia Moreno',   phone: '3138901234', email: undefined },
    { name: 'Ricardo Jiménez',  phone: '3169012345', email: 'ricardo.jimenez@gmail.com' },
    { name: 'Marcela Ruiz',     phone: '3220123456', email: 'marcela.ruiz@hotmail.com' },
    { name: 'Sebastián Castro', phone: '3101234568', email: undefined },
    { name: 'Liliana Rojas',    phone: '3152345679', email: 'liliana.rojas@gmail.com' },
    { name: 'Fernando Díaz',    phone: '3003456780', email: 'fernando.diaz@gmail.com' },
    { name: 'Natalia Medina',   phone: '3124567891', email: 'natalia.medina@yahoo.com' },
    { name: 'Camilo Suárez',    phone: '3185678902', email: undefined },
  ];

  const clients = await dataSource.getRepository(ClientEntity).save(
    clientsData.map((c) => dataSource.getRepository(ClientEntity).create(c)),
  );

  // ── Pólizas ───────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const policiesData: Partial<PolicyEntity>[] = [
    // AL_DIA (+30, +45, +60)
    {
      insurer: 'SURA',
      type: PolicyType.AUTO,
      expirationDate: addDays(today, 30),
      isManaged: false,
      isRenewed: false,
      client: clients[0],
      clientId: clients[0].id,
    },
    {
      insurer: 'Bolívar',
      type: PolicyType.HOGAR,
      expirationDate: addDays(today, 45),
      isManaged: false,
      isRenewed: false,
      client: clients[1],
      clientId: clients[1].id,
    },
    {
      insurer: 'Allianz',
      type: PolicyType.VIDA,
      expirationDate: addDays(today, 60),
      isManaged: false,
      isRenewed: false,
      client: clients[2],
      clientId: clients[2].id,
    },
    // POR_VENCER (+7, +8, +9)
    {
      insurer: 'Mapfre',
      type: PolicyType.AUTO,
      expirationDate: addDays(today, 7),
      isManaged: false,
      isRenewed: false,
      client: clients[3],
      clientId: clients[3].id,
    },
    {
      insurer: 'AXA',
      type: PolicyType.HOGAR,
      expirationDate: addDays(today, 8),
      isManaged: false,
      isRenewed: false,
      client: clients[4],
      clientId: clients[4].id,
    },
    {
      insurer: 'SURA',
      type: PolicyType.OTRO,
      expirationDate: addDays(today, 9),
      isManaged: false,
      isRenewed: false,
      client: clients[5],
      clientId: clients[5].id,
    },
    // CRITICO (+1, +2, +4)
    {
      insurer: 'Bolívar',
      type: PolicyType.AUTO,
      expirationDate: addDays(today, 1),
      isManaged: true,
      isRenewed: false,
      notes: 'Llamé el lunes, cliente interesado en renovar con Bolívar',
      client: clients[6],
      clientId: clients[6].id,
    },
    {
      insurer: 'Allianz',
      type: PolicyType.VIDA,
      expirationDate: addDays(today, 2),
      isManaged: false,
      isRenewed: false,
      client: clients[7],
      clientId: clients[7].id,
    },
    {
      insurer: 'Mapfre',
      type: PolicyType.AUTO,
      expirationDate: addDays(today, 4),
      isManaged: true,
      isRenewed: false,
      notes: 'Cliente pidió cotización, enviada por WhatsApp',
      client: clients[8],
      clientId: clients[8].id,
    },
    // EN_VENTANA (-5, -10, -20, -28)
    {
      insurer: 'AXA',
      type: PolicyType.HOGAR,
      expirationDate: addDays(today, -5),
      isManaged: true,
      isRenewed: false,
      notes: 'Llamé el viernes, cliente evaluando opciones con SURA y AXA',
      client: clients[9],
      clientId: clients[9].id,
    },
    {
      insurer: 'SURA',
      type: PolicyType.AUTO,
      expirationDate: addDays(today, -10),
      isManaged: false,
      isRenewed: false,
      client: clients[10],
      clientId: clients[10].id,
    },
    {
      insurer: 'Bolívar',
      type: PolicyType.OTRO,
      expirationDate: addDays(today, -20),
      isManaged: true,
      isRenewed: false,
      notes: 'Segunda llamada, espera respuesta del cliente esta semana',
      client: clients[11],
      clientId: clients[11].id,
    },
    {
      insurer: 'Allianz',
      type: PolicyType.VIDA,
      expirationDate: addDays(today, -28),
      isManaged: false,
      isRenewed: false,
      client: clients[12],
      clientId: clients[12].id,
    },
    // PERDIDA (-35, -45)
    {
      insurer: 'Mapfre',
      type: PolicyType.AUTO,
      expirationDate: addDays(today, -35),
      isManaged: false,
      isRenewed: false,
      client: clients[13],
      clientId: clients[13].id,
    },
    {
      insurer: 'AXA',
      type: PolicyType.HOGAR,
      expirationDate: addDays(today, -45),
      isManaged: false,
      isRenewed: false,
      client: clients[14],
      clientId: clients[14].id,
    },
    // RENOVADA (-15 días, isManaged + isRenewed)
    {
      insurer: 'SURA',
      type: PolicyType.AUTO,
      expirationDate: addDays(today, -15),
      isManaged: true,
      isRenewed: true,
      notes: 'Renovada exitosamente con SURA, nueva póliza emitida',
      client: clients[0],
      clientId: clients[0].id,
    },
  ];

  await dataSource.getRepository(PolicyEntity).save(
    policiesData.map((p) => dataSource.getRepository(PolicyEntity).create(p)),
  );

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
