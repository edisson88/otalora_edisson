// Mock typeorm decorators — unit tests don't need the real ORM, only the class shape
jest.mock('typeorm', () => ({
  Column: () => () => {},
  CreateDateColumn: () => () => {},
  Entity: () => () => {},
  ManyToOne: () => () => {},
  PrimaryGeneratedColumn: () => () => {},
  UpdateDateColumn: () => () => {},
}), { virtual: true });

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: () => 'PolicyEntityRepository',
}), { virtual: true });

import { BadRequestException } from '@nestjs/common';
import { PolicyEntity, PolicyType } from './policy.entity';
import { PoliciesService, PolicyStatus } from './policies.service';

function daysFromToday(delta: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + delta);
  return d;
}

function makePolicy(overrides: Partial<PolicyEntity> = {}): PolicyEntity {
  const p = new PolicyEntity();
  p.id = 'test-id';
  p.insurer = 'SURA';
  p.type = PolicyType.AUTO;
  p.isManaged = false;
  p.isRenewed = false;
  p.notes = '';
  p.expirationDate = daysFromToday(-5);
  p.clientId = 'client-id';
  p.client = { id: 'client-id', name: 'Test', phone: '3001234567', email: null } as any;
  return Object.assign(p, overrides);
}

function makeService(repoOverrides: Record<string, jest.Mock> = {}) {
  const repo = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    ...repoOverrides,
  };
  const service = new PoliciesService(repo as any);
  return { service, repo };
}

describe('PoliciesService', () => {
  describe('Test 1 — Regla de negocio: no renovar sin gestionar', () => {
    it('debe lanzar BadRequestException y no llamar save()', async () => {
      const { service, repo } = makeService({
        findOne: jest.fn().mockResolvedValue(makePolicy({ isManaged: false })),
      });

      await expect(service.update('test-id', { isRenewed: true })).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('Test 2 — Cálculo de status: caso límite de 30 días', () => {
    it('día 30 vencida → EN_VENTANA (todavía recuperable)', () => {
      const { service } = makeService();
      const result = service['calculateStatus'](daysFromToday(-30), false);
      expect(result.status).toBe(PolicyStatus.EN_VENTANA);
    });

    it('día 31 vencida → PERDIDA (ventana cerrada)', () => {
      const { service } = makeService();
      const result = service['calculateStatus'](daysFromToday(-31), false);
      expect(result.status).toBe(PolicyStatus.PERDIDA);
    });
  });

  describe('Test 3 — Flujo completo de actualización válida', () => {
    it('actualizar isRenewed con isManaged=true → status RENOVADA', async () => {
      const base = makePolicy({ isManaged: true, isRenewed: false });
      const { service, repo } = makeService({
        findOne: jest.fn().mockResolvedValue(base),
        save: jest.fn().mockImplementation(async (p: PolicyEntity) => p),
      });

      const result = await service.update('test-id', { isRenewed: true });

      expect(result.status).toBe(PolicyStatus.RENOVADA);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isRenewed: true }),
      );
    });
  });
});
