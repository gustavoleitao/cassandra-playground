import { Injectable } from '@nestjs/common';
import { CassandraService } from '../cassandra/cassandra.service';
import { ExecuteQueryDto } from './dto/execute-query.dto';

@Injectable()
export class QueryService {
  constructor(private readonly cassandraService: CassandraService) {}

  async execute(dto: ExecuteQueryDto) {
    const client = this.cassandraService.getClient();
    const statements = this.splitStatements(dto.cql);
    const start = Date.now();

    let lastResult: import('cassandra-driver').types.ResultSet | null = null;
    for (const statement of statements) {
      lastResult = await client.execute(statement, [], {
        prepare: false,
        keyspace: dto.keyspace,
      });
    }

    const executionTime = Date.now() - start;

    if (!lastResult) {
      return { columns: [], rows: [], rowCount: 0, executionTime, statementsExecuted: 0 };
    }

    const columns = lastResult.columns ? lastResult.columns.map((c) => c.name) : [];
    const rows = (lastResult.rows ?? []).map((row) =>
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
      statementsExecuted: statements.length,
    };
  }

  private splitStatements(cql: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inString = false;

    for (let i = 0; i < cql.length; i++) {
      const ch = cql[i];
      if (ch === "'" && cql[i - 1] !== '\\') inString = !inString;
      if (ch === ';' && !inString) {
        const trimmed = current.trim();
        if (trimmed) statements.push(trimmed);
        current = '';
      } else {
        current += ch;
      }
    }

    const trimmed = current.trim();
    if (trimmed) statements.push(trimmed);

    return statements;
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
