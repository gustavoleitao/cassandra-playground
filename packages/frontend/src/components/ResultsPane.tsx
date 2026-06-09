import type { QueryResult } from '../api';

interface Props {
  result: QueryResult | null;
  error: string | null;
  loading: boolean;
}

export function ResultsPane({ result, error, loading }: Props) {
  if (loading) {
    return <div className="results-pane results-loading">Executing…</div>;
  }

  if (error) {
    return (
      <div className="results-pane results-error">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!result) {
    return <div className="results-pane results-empty">Run a query to see results.</div>;
  }

  if (result.columns.length === 0) {
    return (
      <div className="results-pane results-empty">
        Query executed successfully. {result.executionTime}ms
      </div>
    );
  }

  return (
    <div className="results-pane">
      <div className="results-meta">
        {result.rowCount} row{result.rowCount !== 1 ? 's' : ''} — {result.executionTime}ms
      </div>
      <div className="results-table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              {result.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, i) => (
              <tr key={i}>
                {result.columns.map((col) => (
                  <td key={col}>
                    {row[col] === null ? <span className="null-value">null</span> : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
