import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ProjectCreationModal } from "@/components/project-creation-modal";
import { TimelineEditor } from "@/components/timeline-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getProjectTypeIcon, getProjectTypeColor, getStatusBgColor } from "@/lib/utils";
import { Plus, Folder, Film, Music, Mic, TrendingUp, Play, Edit, Download, X } from "lucide-react";
import type { Project, Generation, User } from "@shared/schema";

export default function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, lastMessage } = useWebSocket();

  // Queries
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user']
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects']
  });

  const { data: activeGenerations = [] } = useQuery<Generation[]>({
    queryKey: ['/api/generations/active']
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (project: any) => apiRequest('POST', '/api/projects', project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project Created",
        description: "Your new project has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // WebSocket message handling
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'generation_progress':
        case 'generation_completed':
        case 'generation_error':
          queryClient.invalidateQueries({ queryKey: ['/api/generations/active'] });
          queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
          break;
        case 'project_created':
        case 'project_updated':
        case 'project_deleted':
          queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
          break;
      }
    }
  }, [lastMessage, queryClient]);

  const handleCreateProject = async (projectData: any) => {
    const result = await createProjectMutation.mutateAsync(projectData);
    return result;
  };

  const stats = {
    totalProjects: projects.length,
    moviesCreated: projects.filter(p => p.type === 'movie' && p.status === 'completed').length,
    songsGenerated: projects.filter(p => p.type === 'music' && p.status === 'completed').length,
    processing: projects.filter(p => p.status === 'generating' || p.status === 'processing').length
  };

  const recentProjects = projects.slice(0, 6);

  if (activeView !== 'dashboard') {
    return (
      <div className="min-h-screen bg-[var(--dark)] text-slate-50">
        <Header user={user} isServerRunning={isConnected} />
        <div className="flex pt-16">
          <Sidebar 
            activeView={activeView} 
            onNavigate={setActiveView} 
            stats={stats}
          />
          <main className="flex-1 ml-64 p-6">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-white mb-4">
                {activeView === 'movie' && 'Movie Studio'}
                {activeView === 'music' && 'Music Lab'}
                {activeView === 'voice' && 'Voice Studio'}
                {activeView === 'analysis' && 'Content Analysis'}
                {activeView === 'settings' && 'Settings'}
              </h2>
              <p className="text-slate-400">This section is coming soon!</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--dark)] text-slate-50">
      <Header user={user} isServerRunning={isConnected} />
      
      <div className="flex pt-16">
        <Sidebar 
          activeView={activeView} 
          onNavigate={setActiveView} 
          stats={stats}
        />

        <main className="flex-1 ml-64 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {/* Dashboard Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                  <p className="text-slate-400">Create unlimited AI content without restrictions</p>
                </div>
                
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[hsl(238,79%,66%)] hover:bg-[hsl(238,79%,66%)]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-[var(--surface)] border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Projects</p>
                      <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
                    </div>
                    <div className="w-12 h-12 bg-[hsl(238,79%,66%)]/10 rounded-lg flex items-center justify-center">
                      <Folder className="w-6 h-6 text-[hsl(238,79%,66%)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[var(--surface)] border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Movies Created</p>
                      <p className="text-2xl font-bold text-white">{stats.moviesCreated}</p>
                    </div>
                    <div className="w-12 h-12 bg-[hsl(160,84%,39%)]/10 rounded-lg flex items-center justify-center">
                      <Film className="w-6 h-6 text-[hsl(160,84%,39%)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[var(--surface)] border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Songs Generated</p>
                      <p className="text-2xl font-bold text-white">{stats.songsGenerated}</p>
                    </div>
                    <div className="w-12 h-12 bg-[hsl(43,96%,56%)]/10 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-[hsl(43,96%,56%)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[var(--surface)] border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Processing</p>
                      <p className="text-2xl font-bold text-white">{stats.processing}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-500 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Generations */}
            {activeGenerations.length > 0 && (
              <div className="px-6 mb-6">
                <Card className="bg-[var(--surface)] border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Active Generations</h3>
                      <span className="text-sm text-slate-400">Real-time Progress</span>
                    </div>
                    
                    <div className="space-y-4">
                      {activeGenerations.map((generation) => {
                        const project = projects.find(p => p.id === generation.projectId);
                        return (
                          <div key={generation.id} className="flex items-center space-x-4 p-4 bg-[var(--surface-light)] rounded-lg">
                            <div className="w-12 h-12 bg-[hsl(238,79%,66%)]/10 rounded-lg flex items-center justify-center">
                              <i className={`fas ${getProjectTypeIcon(generation.type)} ${getProjectTypeColor(generation.type)}`}></i>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-white">
                                  {project?.title || 'Unknown Project'}
                                </h4>
                                <span className="text-sm text-slate-400">{generation.progress}%</span>
                              </div>
                              <Progress value={generation.progress} className="mb-2" />
                              <div className="flex items-center justify-between text-sm text-slate-400">
                                <span>{generation.status === 'processing' ? 'Processing...' : 'Pending...'}</span>
                                <span>~{Math.max(1, Math.ceil((100 - generation.progress) / 10))} min remaining</span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Projects */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
                <Button variant="ghost" className="text-slate-400 hover:text-white text-sm">
                  View All
                </Button>
              </div>
              
              {projectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-[var(--surface)] border-slate-700">
                      <div className="w-full h-40 bg-slate-700 animate-pulse"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-slate-700 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-slate-700 rounded animate-pulse mb-3"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-slate-700 rounded animate-pulse w-16"></div>
                          <div className="flex space-x-2">
                            <div className="w-6 h-6 bg-slate-700 rounded animate-pulse"></div>
                            <div className="w-6 h-6 bg-slate-700 rounded animate-pulse"></div>
                            <div className="w-6 h-6 bg-slate-700 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <Card className="bg-[var(--surface)] border-slate-700">
                  <CardContent className="p-12 text-center">
                    <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No Projects Yet</h4>
                    <p className="text-slate-400 mb-4">Create your first AI-powered content project to get started.</p>
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-[hsl(238,79%,66%)] hover:bg-[hsl(238,79%,66%)]/90 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentProjects.map((project) => (
                    <Card key={project.id} className="bg-[var(--surface)] border-slate-700 overflow-hidden hover:border-slate-600 transition-colors">
                      <div className="w-full h-40 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <i className={`fas ${getProjectTypeIcon(project.type)} text-4xl ${getProjectTypeColor(project.type)}`}></i>
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white truncate">{project.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBgColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">
                          {project.quality} • {project.duration || 'No duration set'}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <i className={`fas ${getProjectTypeIcon(project.type)} text-sm ${getProjectTypeColor(project.type)}`}></i>
                            <span className="text-xs text-slate-400 capitalize">{project.type}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white p-1">
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white p-1">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white p-1">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <ProjectCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
