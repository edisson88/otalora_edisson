import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<UserEntity>);
    findByEmail(email: string): Promise<UserEntity | null>;
    create(email: string, password: string, name: string): Promise<UserEntity>;
}
