import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'How many rows do you need',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'How many rows do you want to skip',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number;

  @ApiProperty({
    default: '',
    description: 'Filter results by gender',
  })
  @IsOptional()
  @IsIn(['men', 'women', 'unisex', 'kid'])
  gender?: 'men' | 'women' | 'unisex' | 'kid';
}
