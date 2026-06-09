import { Injectable } from '@nestjs/common';
import { CassandraService } from '../cassandra/cassandra.service';
import { ExecuteQueryDto } from './dto/execute-query.dto';

@Injectable()
export class QueryService {
  constructor(private readonly cassandraService: CassandraService) {}

  async execute(dto: ExecuteQueryDto) {
    const client = this.cassandraService.getClient();
    const start = Date.now();

    const result = await client.execute(dto.cql, [], {
      prepare: false,
      keyspace: dto.keyspace,
    });

    const executionTime = Date.now() - start;
    const columns = result.columns ? result.columns.map((c) => c.name) : [];
    const rows = result.rows.map((row) =>
      columns.reduce(
        (acc, col) => {
          const val = row[col];
          acc[col] = val === null || val === undefined ? null : this.serializeValue(val);
          return acc;
        },
        {} as Record<string, unknown>,
      ),
    );

    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTime,
    };
  }

  private serializeValue(val: unknown): unknown {
    if (val instanceof Date) return val.toISOString();
    if (Buffer.isBuffer(val)) return val.toString('hex');
    if (typeof val === 'bigint') return val.toString();
    if (val !== null && typeof val === 'object' && 'toString' in val) {
      // covers Long, UUID, InetAddress, etc.
      const str = (val as { toString(): string }).toString();
      return str;
    }
    return val;
  }
}
