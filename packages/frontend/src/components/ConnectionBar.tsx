import { useState } from 'react';
import { api } from '../api';
import type { ConnectConfig } from '../api';

interface Props {
  onConnected: () => void;
}

export function ConnectionBar({ onConnected }: Props) {
  const [config, setConfig] = useState<ConnectConfig>({
    host: 'localhost',
    port: 9042,
    localDataCenter: 'datacenter1',
    username: '',
    password: '',
  });
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleConnect() {
    setStatus('connecting');
    setErrorMsg('');
    try {
      await api.connect({
        ...config,
        username: config.username || undefined,
        password: config.password || undefined,
      });
      setStatus('connected');
      onConnected();
    } catch (e) {
      setStatus('error');
      setErrorMsg(e instanceof Error ? e.message : 'Connection failed');
    }
  }

  function field(label: string, key: keyof ConnectConfig, type = 'text') {
    return (
      <label className="conn-field">
        <span>{label}</span>
        <input
          type={type}
          value={String(config[key] ?? '')}
          onChange={(e) =>
            setConfig((prev) => ({
              ...prev,
              [key]: key === 'port' ? Number(e.target.value) : e.target.value,
            }))
          }
        />
      </label>
    );
  }

  return (
    <div className="connection-bar">
      {field('Host', 'host')}
      {field('Port', 'port', 'number')}
      {field('Datacenter', 'localDataCenter')}
      {field('User', 'username')}
      {field('Password', 'password', 'password')}
      <button onClick={handleConnect} disabled={status === 'connecting'} className="btn-connect">
        {status === 'connecting' ? 'Connecting…' : 'Connect'}
      </button>
      <span
        className={`conn-status ${status === 'connected' ? 'ok' : status === 'error' ? 'err' : ''}`}
        title={errorMsg || undefined}
      >
        {status === 'connected' ? '● Connected' : status === 'error' ? '● Error' : '○ Disconnected'}
      </span>
    </div>
  );
}
