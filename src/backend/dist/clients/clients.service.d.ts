import { Repository } from 'typeorm';
import { ClientEntity } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
export declare class ClientsService {
    private readonly clientsRepository;
    constructor(clientsRepository: Repository<ClientEntity>);
    findAll(): Promise<ClientEntity[]>;
    findOne(id: string): Promise<ClientEntity>;
    create(dto: CreateClientDto): Promise<ClientEntity>;
}
