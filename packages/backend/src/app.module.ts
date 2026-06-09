import { Module } from '@nestjs/common';
import { CassandraModule } from './cassandra/cassandra.module';
import { SchemaModule } from './schema/schema.module';
import { QueryModule } from './query/query.module';

@Module({
  imports: [CassandraModule, SchemaModule, QueryModule],
})
export class AppModule {}
