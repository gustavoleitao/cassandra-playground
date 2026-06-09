export interface ConnectConfig {
  host: string;
  port: number;
  localDataCenter: string;
  username?: string;
  password?: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  isPartitionKey: boolean;
  isClusteringKey: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnInfo[];
  partitionKeys: string[];
  clusteringKeys: string[];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return body as T;
}

export const api = {
  connect: (config: ConnectConfig) =>
    request<{ connected: boolean }>('/api/connect', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  getKeyspaces: () => request<string[]>('/api/keyspaces'),

  getTables: (keyspace: string) =>
    request<string[]>(`/api/keyspaces/${encodeURIComponent(keyspace)}/tables`),

  getTableSchema: (keyspace: string, table: string) =>
    request<TableSchema>(
      `/api/keyspaces/${encodeURIComponent(keyspace)}/tables/${encodeURIComponent(table)}`,
    ),

  executeQuery: (cql: string, keyspace?: string) =>
    request<QueryResult>('/api/query', {
      method: 'POST',
      body: JSON.stringify({ cql, keyspace }),
    }),
};
