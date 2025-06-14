import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Download, Square, SkipBack, SkipForward } from "lucide-react";

interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'voice';
  color: string;
  segments: {
    id: string;
    start: number;
    duration: number;
    content: string;
  }[];
}

interface TimelineEditorProps {
  project?: any;
  onExport?: (settings: any) => void;
}

export function TimelineEditor({ project, onExport }: TimelineEditorProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(330); // 5:30 in seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [tracks] = useState<TimelineTrack[]>([
    {
      id: 'video',
      name: 'Video',
      type: 'video',
      color: 'bg-[hsl(238,79%,66%)]/50',
      segments: [
        { id: 'scene1', start: 0, duration: 180, content: 'Scene 1' }
      ]
    },
    {
      id: 'audio',
      name: 'Audio',
      type: 'audio',
      color: 'bg-[hsl(160,84%,39%)]/50',
      segments: [
        { id: 'bgmusic', start: 10, duration: 300, content: 'Background Music' }
      ]
    },
    {
      id: 'voice',
      name: 'Voice',
      type: 'voice',
      color: 'bg-[hsl(43,96%,56%)]/50',
      segments: [
        { id: 'narration', start: 30, duration: 120, content: 'Narration' }
      ]
    }
  ]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSegmentStyle = (segment: any): React.CSSProperties => {
    const startPercent = (segment.start / duration) * 100;
    const widthPercent = (segment.duration / duration) * 100;
    
    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const newTime = clickPercent * duration;
    
    setCurrentTime(Math.max(0, Math.min(duration, newTime)));
  };

  const playheadPosition = (currentTime / duration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  return (
    <div className="bg-[var(--surface)] border-t border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Timeline Editor</h3>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handlePlayPause}
            size="sm"
            className="bg-[hsl(238,79%,66%)]/10 text-[hsl(238,79%,66%)] hover:bg-[hsl(238,79%,66%)]/20 border border-[hsl(238,79%,66%)]/20"
          >
            {isPlaying ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? 'Stop' : 'Preview'}
          </Button>
          <Button
            onClick={() => onExport?.({})}
            size="sm"
            className="bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] hover:bg-[hsl(160,84%,39%)]/20 border border-[hsl(160,84%,39%)]/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
          <SkipBack className="w-4 h-4" />
        </Button>
        <div className="text-sm text-slate-400 font-mono min-w-[4rem]">
          {formatTime(currentTime)}
        </div>
        <div className="flex-1 relative">
          <Slider
            value={[currentTime]}
            onValueChange={([value]) => setCurrentTime(value)}
            max={duration}
            step={0.1}
            className="w-full"
          />
        </div>
        <div className="text-sm text-slate-400 font-mono min-w-[4rem]">
          {formatTime(duration)}
        </div>
        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Timeline */}
      <div className="bg-[var(--surface-light)] rounded-lg p-4 min-h-48">
        {/* Time ruler */}
        <div 
          ref={timelineRef}
          className="relative h-6 bg-slate-700 rounded mb-4 cursor-pointer"
          onClick={handleTimelineClick}
        >
          {/* Time markers */}
          {Array.from({ length: Math.ceil(duration / 30) }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-slate-600 text-xs text-slate-400 pl-1"
              style={{ left: `${(i * 30 / duration) * 100}%` }}
            >
              {i > 0 && formatTime(i * 30)}
            </div>
          ))}
          
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[hsl(238,79%,66%)] z-10 pointer-events-none"
            style={{ left: `${playheadPosition}%` }}
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-[hsl(238,79%,66%)] rounded-full"></div>
          </div>
        </div>
        
        {/* Track lanes */}
        <div className="space-y-2">
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-slate-400 font-medium">
                {track.name}
              </div>
              <div className="flex-1 h-8 bg-slate-700 rounded relative">
                {track.segments.map((segment) => (
                  <div
                    key={segment.id}
                    className={`absolute inset-y-1 ${track.color} rounded flex items-center px-2 cursor-move hover:opacity-80 transition-opacity`}
                    style={getSegmentStyle(segment)}
                  >
                    <span className="text-xs text-white font-medium truncate">
                      {segment.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Zoom:</span>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={0.5}
              max={3}
              step={0.1}
              className="w-32"
            />
            <span className="text-sm text-slate-400">{Math.round(zoom * 100)}%</span>
          </div>
          
          <div className="text-sm text-slate-400">
            Duration: {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
}
