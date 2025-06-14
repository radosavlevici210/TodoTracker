import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Film, Music, Mic, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: any) => void;
}

const projectTypes = [
  {
    id: 'movie',
    label: 'Movie Studio',
    description: 'Create cinematic content from scripts with 8K quality',
    icon: Film,
    color: 'border-[hsl(238,79%,66%)] hover:border-[hsl(238,79%,66%)]',
    bgColor: 'bg-[hsl(238,79%,66%)]/10 group-hover:bg-[hsl(238,79%,66%)]/20',
    iconColor: 'text-[hsl(238,79%,66%)]'
  },
  {
    id: 'music',
    label: 'Music Lab',
    description: 'Generate professional music from lyrics and prompts',
    icon: Music,
    color: 'border-[hsl(160,84%,39%)] hover:border-[hsl(160,84%,39%)]',
    bgColor: 'bg-[hsl(160,84%,39%)]/10 group-hover:bg-[hsl(160,84%,39%)]/20',
    iconColor: 'text-[hsl(160,84%,39%)]'
  },
  {
    id: 'voice',
    label: 'Voice Studio',
    description: 'Synthesize natural-sounding voices from text',
    icon: Mic,
    color: 'border-[hsl(43,96%,56%)] hover:border-[hsl(43,96%,56%)]',
    bgColor: 'bg-[hsl(43,96%,56%)]/10 group-hover:bg-[hsl(43,96%,56%)]/20',
    iconColor: 'text-[hsl(43,96%,56%)]'
  },
  {
    id: 'analysis',
    label: 'Content Analysis',
    description: 'Analyze and optimize existing content with AI',
    icon: TrendingUp,
    color: 'border-blue-500 hover:border-blue-500',
    bgColor: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    iconColor: 'text-blue-500'
  }
];

const qualityOptions = [
  { value: '8k', label: '8K Ultra HD' },
  { value: '4k', label: '4K Ultra HD' },
  { value: 'imax', label: 'IMAX Quality' },
  { value: '1080p', label: '1080p HD' },
  { value: '720p', label: '720p Standard' }
];

export function ProjectCreationModal({ isOpen, onClose, onCreateProject }: ProjectCreationModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quality: '8k',
    duration: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !formData.title) return;

    onCreateProject({
      ...formData,
      type: selectedType,
      status: 'draft',
      progress: 0
    });

    // Reset form
    setSelectedType('');
    setFormData({
      title: '',
      description: '',
      quality: '8k',
      duration: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--surface)] border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {projectTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "p-6 bg-[var(--surface-light)] rounded-xl border transition-colors group text-left",
                    isSelected ? type.color : "border-slate-600 hover:border-slate-500"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                    isSelected ? type.bgColor : "bg-slate-600/20 group-hover:bg-slate-600/30"
                  )}>
                    <Icon className={cn("w-6 h-6", isSelected ? type.iconColor : "text-slate-400")} />
                  </div>
                  <h4 className="font-medium text-white mb-2">{type.label}</h4>
                  <p className="text-sm text-slate-400">{type.description}</p>
                </button>
              );
            })}
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-300">Project Name</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 bg-[var(--surface-light)] border-slate-600 text-white placeholder-slate-400 focus:border-[hsl(238,79%,66%)]"
                placeholder="Enter project name..."
                required
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-300">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 bg-[var(--surface-light)] border-slate-600 text-white placeholder-slate-400 focus:border-[hsl(238,79%,66%)] h-24 resize-none"
                placeholder="Describe your project..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-300">Quality</Label>
                <Select value={formData.quality} onValueChange={(value) => setFormData({ ...formData, quality: value })}>
                  <SelectTrigger className="mt-2 bg-[var(--surface-light)] border-slate-600 text-white focus:border-[hsl(238,79%,66%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--surface-light)] border-slate-600">
                    {qualityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white focus:bg-[hsl(238,79%,66%)]/20">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-slate-300">Duration</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="mt-2 bg-[var(--surface-light)] border-slate-600 text-white placeholder-slate-400 focus:border-[hsl(238,79%,66%)]"
                  placeholder="e.g., 5:30"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[hsl(238,79%,66%)] hover:bg-[hsl(238,79%,66%)]/90 text-white"
              disabled={!selectedType || !formData.title}
            >
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
