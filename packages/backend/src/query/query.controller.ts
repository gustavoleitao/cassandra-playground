import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { QueryService } from './query.service';
import { ExecuteQueryDto } from './dto/execute-query.dto';

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  execute(@Body() dto: ExecuteQueryDto) {
    return this.queryService.execute(dto);
  }
}
