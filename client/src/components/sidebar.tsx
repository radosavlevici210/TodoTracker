import { cn } from "@/lib/utils";
import { 
  Home, 
  Film, 
  Music, 
  Mic, 
  TrendingUp, 
  Settings,
  Folder
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  stats: {
    totalProjects: number;
    processing: number;
  };
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'movie', label: 'Movie Studio', icon: Film },
  { id: 'music', label: 'Music Lab', icon: Music },
  { id: 'voice', label: 'Voice Studio', icon: Mic },
  { id: 'analysis', label: 'Content Analysis', icon: TrendingUp },
];

export function Sidebar({ activeView, onNavigate, stats }: SidebarProps) {
  return (
    <aside className="w-64 bg-[var(--surface)] border-r border-slate-700 p-4 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors",
                isActive
                  ? "bg-[hsl(238,79%,66%)]/10 text-[hsl(238,79%,66%)] border border-[hsl(238,79%,66%)]/20"
                  : "text-slate-300 hover:bg-[var(--surface-light)]"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
        
        <div className="pt-4 border-t border-slate-700 mt-4">
          <button
            onClick={() => onNavigate('settings')}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors",
              activeView === 'settings'
                ? "bg-[hsl(238,79%,66%)]/10 text-[hsl(238,79%,66%)] border border-[hsl(238,79%,66%)]/20"
                : "text-slate-300 hover:bg-[var(--surface-light)]"
            )}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </nav>
      
      <div className="mt-8 p-4 bg-[var(--surface-light)] rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">API Usage</span>
          <span className="text-xs text-slate-400">Unlimited</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-[hsl(160,84%,39%)] h-2 rounded-full w-full"></div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Standalone Edition - No Limits</p>
      </div>
      
      <div className="mt-4 p-4 bg-[var(--surface-light)] rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <Folder className="w-4 h-4 text-[hsl(238,79%,66%)]" />
          <span className="text-sm font-medium">Quick Stats</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Projects:</span>
            <span className="text-white">{stats.totalProjects}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Processing:</span>
            <span className="text-[hsl(43,96%,56%)]">{stats.processing}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
