import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function getProjectTypeIcon(type: string): string {
  switch (type) {
    case 'movie': return 'fa-film';
    case 'music': return 'fa-music';
    case 'voice': return 'fa-microphone';
    case 'analysis': return 'fa-chart-line';
    default: return 'fa-file';
  }
}

export function getProjectTypeColor(type: string): string {
  switch (type) {
    case 'movie': return 'text-primary';
    case 'music': return 'text-secondary';
    case 'voice': return 'text-accent';
    case 'analysis': return 'text-blue-500';
    default: return 'text-slate-400';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-secondary';
    case 'processing': case 'generating': return 'text-accent';
    case 'error': return 'text-destructive';
    case 'draft': return 'text-slate-400';
    default: return 'text-slate-400';
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-secondary/10 text-secondary';
    case 'processing': case 'generating': return 'bg-accent/10 text-accent';
    case 'error': return 'bg-destructive/10 text-destructive';
    case 'draft': return 'bg-slate-500/10 text-slate-400';
    default: return 'bg-slate-500/10 text-slate-400';
  }
}
