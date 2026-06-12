import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientEntity } from './client.entity';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    findAll(): Promise<ClientEntity[]>;
    findOne(id: string): Promise<ClientEntity>;
    create(dto: CreateClientDto): Promise<ClientEntity>;
}
