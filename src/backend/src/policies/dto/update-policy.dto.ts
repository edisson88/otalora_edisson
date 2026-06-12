import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePolicyDto {
  @IsBoolean()
  @IsOptional()
  isManaged?: boolean;

  @IsBoolean()
  @IsOptional()
  isRenewed?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
