import { IsString, IsOptional } from 'class-validator';

export class ExecuteQueryDto {
  @IsString()
  cql: string;

  @IsOptional()
  @IsString()
  keyspace?: string;
}
