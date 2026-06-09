import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryController } from './query.controller';
import { CassandraModule } from '../cassandra/cassandra.module';

@Module({
  imports: [CassandraModule],
  controllers: [QueryController],
  providers: [QueryService],
})
export class QueryModule {}
