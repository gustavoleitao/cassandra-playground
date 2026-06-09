import { Injectable } from '@nestjs/common';
import { CassandraService } from '../cassandra/cassandra.service';

@Injectable()
export class SchemaService {
  constructor(private readonly cassandraService: CassandraService) {}

  async getKeyspaces(): Promise<string[]> {
    const client = this.cassandraService.getClient();
    const result = await client.execute(
      'SELECT keyspace_name FROM system_schema.keyspaces',
    );
    return result.rows.map((r) => r['keyspace_name'] as string).sort();
  }

  async getTables(keyspace: string): Promise<string[]> {
    const client = this.cassandraService.getClient();
    const result = await client.execute(
      'SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?',
      [keyspace],
      { prepare: true },
    );
    return result.rows.map((r) => r['table_name'] as string).sort();
  }

  async getTableSchema(keyspace: string, table: string) {
    const client = this.cassandraService.getClient();
    const tableMetadata = await client.metadata.getTable(keyspace, table);
    if (!tableMetadata) throw new Error(`Table "${keyspace}.${table}" not found`);

    return {
      name: tableMetadata.name,
      columns: tableMetadata.columns.map((col) => ({
        name: col.name,
        type: col.type.code.toString(),
        isPartitionKey: tableMetadata.partitionKeys.some((k) => k.name === col.name),
        isClusteringKey: tableMetadata.clusteringKeys.some((k) => k.name === col.name),
      })),
      partitionKeys: tableMetadata.partitionKeys.map((k) => k.name),
      clusteringKeys: tableMetadata.clusteringKeys.map((k) => k.name),
    };
  }
}
