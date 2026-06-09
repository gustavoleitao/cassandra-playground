import { useRef, useState } from 'react';
import { ConnectionBar } from './components/ConnectionBar';
import { SchemaTree } from './components/SchemaTree';
import { QueryEditor } from './components/QueryEditor';
import type { QueryEditorRef } from './components/QueryEditor';
import { ResultsPane } from './components/ResultsPane';
import { api } from './api';
import type { QueryResult } from './api';
import './App.css';

export default function App() {
  const editorRef = useRef<QueryEditorRef>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleConnected() {
    setRefreshTrigger((n) => n + 1);
  }

  function handleTableClick(keyspace: string, table: string) {
    editorRef.current?.setValue(`SELECT * FROM ${keyspace}.${table} LIMIT 100;`);
  }

  async function handleExecute(cql: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.executeQuery(cql);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <ConnectionBar onConnected={handleConnected} />
      <div className="workspace">
        <SchemaTree refreshTrigger={refreshTrigger} onTableClick={handleTableClick} />
        <div className="main-panel">
          <QueryEditor ref={editorRef} onExecute={handleExecute} />
          <ResultsPane result={result} error={error} loading={loading} />
        </div>
      </div>
    </div>
  );
}
