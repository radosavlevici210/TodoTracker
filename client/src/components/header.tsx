import { User } from "lucide-react";

interface HeaderProps {
  user?: {
    firstName: string;
    lastName: string;
  };
  isServerRunning: boolean;
}

export function Header({ user, isServerRunning }: HeaderProps) {
  return (
    <header className="bg-[var(--surface)] border-b border-slate-700 px-6 py-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(238,79%,66%)] to-[hsl(160,84%,39%)] rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Studio Pro</h1>
              <p className="text-xs text-slate-400">Standalone Edition</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-[var(--surface-light)] px-3 py-2 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isServerRunning ? 'bg-[hsl(160,84%,39%)] animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="text-sm text-slate-300">
              {isServerRunning ? 'Server Running' : 'Server Offline'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-slate-400">
            <User className="w-5 h-5" />
            <span className="text-sm">
              {user ? `${user.firstName} ${user.lastName}` : 'AI Studio User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
