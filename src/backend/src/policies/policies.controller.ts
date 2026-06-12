import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesService, PolicyWithStatus, KpiResult } from './policies.service';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Controller('policies')
@UseGuards(JwtAuthGuard)
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  findAll(): Promise<PolicyWithStatus[]> {
    return this.policiesService.findAll();
  }

  @Get('kpis')
  getKpis(): Promise<KpiResult> {
    return this.policiesService.getKpis();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePolicyDto,
  ): Promise<PolicyWithStatus> {
    return this.policiesService.update(id, dto);
  }
}
