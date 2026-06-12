import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientsRepository: Repository<ClientEntity>,
  ) {}

  findAll(): Promise<ClientEntity[]> {
    return this.clientsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<ClientEntity> {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    return client;
  }

  create(dto: CreateClientDto): Promise<ClientEntity> {
    const client = this.clientsRepository.create(dto);
    return this.clientsRepository.save(client);
  }
}
