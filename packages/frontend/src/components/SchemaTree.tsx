import { useState, useEffect } from 'react';
import { api } from '../api';

interface Props {
  refreshTrigger: number;
  onTableClick: (keyspace: string, table: string) => void;
}

export function SchemaTree({ refreshTrigger, onTableClick }: Props) {
  const [keyspaces, setKeyspaces] = useState<string[]>([]);
  const [tables, setTables] = useState<Record<string, string[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  function fetchKeyspaces() {
    setLoading(true);
    setTables({});
    setExpanded(new Set());
    api
      .getKeyspaces()
      .then(setKeyspaces)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (refreshTrigger === 0) return;
    fetchKeyspaces();
  }, [refreshTrigger]);

  async function toggleKeyspace(ks: string) {
    if (expanded.has(ks)) {
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(ks);
        return next;
      });
      return;
    }
    if (!tables[ks]) {
      const tbls = await api.getTables(ks).catch(() => [] as string[]);
      setTables((prev) => ({ ...prev, [ks]: tbls }));
    }
    setExpanded((prev) => new Set(prev).add(ks));
  }

  return (
    <div className="schema-tree">
      <div className="schema-tree-header">
        Schema
        <button className="btn-refresh" onClick={fetchKeyspaces} title="Refresh schema">↺</button>
      </div>
      {loading && <div className="tree-loading">Loading…</div>}
      {keyspaces.map((ks) => (
        <div key={ks} className="ks-item">
          <button className="ks-name" onClick={() => toggleKeyspace(ks)}>
            {expanded.has(ks) ? '▼' : '▶'} {ks}
          </button>
          {expanded.has(ks) && (
            <div className="table-list">
              {(tables[ks] ?? []).map((tbl) => (
                <button key={tbl} className="table-name" onClick={() => onTableClick(ks, tbl)}>
                  {tbl}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
