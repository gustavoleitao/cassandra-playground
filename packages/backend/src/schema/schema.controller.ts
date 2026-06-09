import { Controller, Get, Param } from '@nestjs/common';
import { SchemaService } from './schema.service';

@Controller('keyspaces')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Get()
  getKeyspaces() {
    return this.schemaService.getKeyspaces();
  }

  @Get(':ks/tables')
  getTables(@Param('ks') ks: string) {
    return this.schemaService.getTables(ks);
  }

  @Get(':ks/tables/:table')
  getTableSchema(@Param('ks') ks: string, @Param('table') table: string) {
    return this.schemaService.getTableSchema(ks, table);
  }
}
