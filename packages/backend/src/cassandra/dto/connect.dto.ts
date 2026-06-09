import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ConnectDto {
  @IsString()
  host: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @IsString()
  localDataCenter: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
