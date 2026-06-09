import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CassandraService } from './cassandra.service';
import { ConnectDto } from './dto/connect.dto';

@Controller('connect')
export class CassandraController {
  constructor(private readonly cassandraService: CassandraService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async connect(@Body() dto: ConnectDto) {
    await this.cassandraService.connect(dto);
    return { connected: true };
  }
}
