import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyEntity } from './policy.entity';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';
import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PolicyEntity]),
    AuthModule,
    ClientsModule,
  ],
  providers: [PoliciesService],
  controllers: [PoliciesController],
})
export class PoliciesModule {}
