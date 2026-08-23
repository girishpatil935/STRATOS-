import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { StatusIndicator } from '../ui/StatusIndicator';
import { checkHealth } from '../../services/executiveApi';

type BackendStatus = 'online' | 'offline' | 'checking';

interface PageHeaderProps {
  title?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title = 'Executive Intelligence',
}) => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      try {
        await checkHealth();
        if (!cancelled) setBackendStatus('online');
      } catch {
        if (!cancelled) setBackendStatus('offline');
      }
    };

    ping();
    const interval = setInterval(ping, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 bg-white border-b border-neutral-200 shadow-sm">
      {/* Left — workspace label */}
      <div className="flex items-center gap-2">
        <span className="text-black text-sm font-semibold">{title}</span>
      </div>

      {/* Right — status + avatar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-neutral-50 border border-neutral-200">
          <StatusIndicator status={backendStatus} size="sm" />
          <span className="text-xs text-neutral-500 font-medium">
            {backendStatus === 'online'  ? 'Backend Online'  :
             backendStatus === 'offline' ? 'Backend Offline' :
             'Connecting…'}
          </span>
        </div>

        {/* Avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-neutral-800 transition-colors">
          <User size={15} className="text-white" />
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
