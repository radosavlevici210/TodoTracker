import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import OpenAI from "openai";
import { storage } from "./storage";
import { insertProjectSchema, insertGenerationSchema } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

const DEFAULT_USER_ID = "standalone-user";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });
  });

  function broadcastUpdate(type: string, data: any) {
    const message = JSON.stringify({ type, data });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Auth routes
  app.get('/api/auth/user', async (req, res) => {
    const user = await storage.getUser(DEFAULT_USER_ID);
    res.json(user);
  });

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects(DEFAULT_USER_ID);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      
      const project = await storage.createProject(projectData);
      broadcastUpdate('project_created', project);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.patch('/api/projects/:id', async (req, res) => {
    try {
      const updates = req.body;
      const project = await storage.updateProject(parseInt(req.params.id), updates);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      broadcastUpdate('project_updated', project);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', async (req, res) => {
    try {
      const success = await storage.deleteProject(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      broadcastUpdate('project_deleted', { id: parseInt(req.params.id) });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Generation routes
  app.get('/api/generations', async (req, res) => {
    try {
      const generations = await storage.getGenerations(DEFAULT_USER_ID);
      res.json(generations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });

  app.get('/api/generations/active', async (req, res) => {
    try {
      const activeGenerations = await storage.getActiveGenerations(DEFAULT_USER_ID);
      res.json(activeGenerations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active generations" });
    }
  });

  // AI Generation endpoints
  app.post('/api/generate/movie', async (req, res) => {
    try {
      const { projectId, script, genre, quality, duration, audioEnhancement } = req.body;
      
      const generation = await storage.createGeneration({
        projectId,
        userId: DEFAULT_USER_ID,
        type: "movie",
        prompt: script,
        model: "gpt-4o",
        status: "processing",
        progress: 0
      });

      // Update project status
      await storage.updateProject(projectId, { status: "generating" });
      
      broadcastUpdate('generation_started', generation);

      // Process generation asynchronously
      processMovieGeneration(generation.id, script, genre, quality, duration, audioEnhancement)
        .catch(error => console.error('Movie generation error:', error));

      res.json({ generation });
    } catch (error) {
      console.error("Error starting movie generation:", error);
      res.status(500).json({ message: "Failed to start movie generation" });
    }
  });

  app.post('/api/generate/music', async (req, res) => {
    try {
      const { projectId, lyrics, genre, style, duration } = req.body;
      
      const generation = await storage.createGeneration({
        projectId,
        userId: DEFAULT_USER_ID,
        type: "music",
        prompt: lyrics,
        model: "gpt-4o",
        status: "processing",
        progress: 0
      });

      await storage.updateProject(projectId, { status: "generating" });
      broadcastUpdate('generation_started', generation);

      processMusicGeneration(generation.id, lyrics, genre, style, duration)
        .catch(error => console.error('Music generation error:', error));

      res.json({ generation });
    } catch (error) {
      console.error("Error starting music generation:", error);
      res.status(500).json({ message: "Failed to start music generation" });
    }
  });

  app.post('/api/generate/voice', async (req, res) => {
    try {
      const { projectId, text, voice, style, speed } = req.body;
      
      const generation = await storage.createGeneration({
        projectId,
        userId: DEFAULT_USER_ID,
        type: "voice",
        prompt: text,
        model: "gpt-4o",
        status: "processing",
        progress: 0
      });

      await storage.updateProject(projectId, { status: "generating" });
      broadcastUpdate('generation_started', generation);

      processVoiceGeneration(generation.id, text, voice, style, speed)
        .catch(error => console.error('Voice generation error:', error));

      res.json({ generation });
    } catch (error) {
      console.error("Error starting voice generation:", error);
      res.status(500).json({ message: "Failed to start voice generation" });
    }
  });

  app.post('/api/generate/analysis', async (req, res) => {
    try {
      const { projectId, content, analysisType } = req.body;
      
      const generation = await storage.createGeneration({
        projectId,
        userId: DEFAULT_USER_ID,
        type: "analysis",
        prompt: content,
        model: "gpt-4o",
        status: "processing",
        progress: 0
      });

      await storage.updateProject(projectId, { status: "generating" });
      broadcastUpdate('generation_started', generation);

      processAnalysisGeneration(generation.id, content, analysisType)
        .catch(error => console.error('Analysis generation error:', error));

      res.json({ generation });
    } catch (error) {
      console.error("Error starting analysis generation:", error);
      res.status(500).json({ message: "Failed to start analysis generation" });
    }
  });

  // Generation processing functions
  async function processMovieGeneration(generationId: number, script: string, genre: string, quality: string, duration: string, audioEnhancement: string[]) {
    try {
      // Update progress periodically
      const updateProgress = async (progress: number, status?: string) => {
        const generation = await storage.updateGeneration(generationId, { 
          progress, 
          ...(status && { status })
        });
        if (generation) {
          broadcastUpdate('generation_progress', generation);
        }
      };

      await updateProgress(10);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional film production AI. Create a comprehensive movie production plan with scene breakdown, cinematography notes, and technical specifications. Respond with JSON in this format: 
            {
              "scenes": [{"id": "scene_1", "description": "...", "duration": 120, "visualElements": ["..."], "audioElements": ["..."]}],
              "productionNotes": {"cinematography": "...", "visualEffects": ["..."], "audioSpecs": "...", "exportSettings": {...}},
              "timeline": [{"timestamp": 0, "event": "...", "description": "..."}],
              "metadata": {"totalDuration": "...", "sceneCount": 0, "quality": "...", "genre": "..."}
            }`
          },
          {
            role: "user",
            content: `Create a ${quality} quality ${genre} movie from this script (${duration} duration): ${script}. Include ${audioEnhancement?.join(", ") || "standard"} audio enhancement.`
          },
        ],
        response_format: { type: "json_object" },
      });

      await updateProgress(80);

      const result = JSON.parse(response.choices[0].message.content || "{}");

      await updateProgress(100, "completed");

      const finalGeneration = await storage.updateGeneration(generationId, {
        status: "completed",
        result,
        progress: 100
      });

      // Update project
      const project = await storage.getProject(finalGeneration!.projectId);
      if (project) {
        await storage.updateProject(project.id, {
          status: "completed",
          content: result,
          progress: 100
        });
      }

      broadcastUpdate('generation_completed', finalGeneration);
    } catch (error) {
      console.error('Movie generation error:', error);
      await storage.updateGeneration(generationId, {
        status: "error",
        error: error.message
      });
      broadcastUpdate('generation_error', { id: generationId, error: error.message });
    }
  }

  async function processMusicGeneration(generationId: number, lyrics: string, genre: string, style: string, duration: string) {
    try {
      const updateProgress = async (progress: number, status?: string) => {
        const generation = await storage.updateGeneration(generationId, { 
          progress, 
          ...(status && { status })
        });
        if (generation) {
          broadcastUpdate('generation_progress', generation);
        }
      };

      await updateProgress(15);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional music producer. Create a comprehensive music production plan with arrangement, instrumentation, and technical specifications. Respond with JSON in this format:
            {
              "arrangement": {"intro": "...", "verse": "...", "chorus": "...", "bridge": "...", "outro": "..."},
              "instrumentation": ["...", "...", "..."],
              "production": {"tempo": 0, "key": "...", "timeSignature": "...", "genre": "...", "style": "..."},
              "timeline": [{"timestamp": 0, "element": "...", "description": "..."}],
              "metadata": {"duration": "...", "genre": "...", "style": "...", "complexity": "..."}
            }`
          },
          {
            role: "user",
            content: `Create a ${genre} ${style} song with these lyrics (${duration} duration): ${lyrics}`
          },
        ],
        response_format: { type: "json_object" },
      });

      await updateProgress(85);

      const result = JSON.parse(response.choices[0].message.content || "{}");

      await updateProgress(100, "completed");

      const finalGeneration = await storage.updateGeneration(generationId, {
        status: "completed",
        result,
        progress: 100
      });

      const project = await storage.getProject(finalGeneration!.projectId);
      if (project) {
        await storage.updateProject(project.id, {
          status: "completed",
          content: result,
          progress: 100
        });
      }

      broadcastUpdate('generation_completed', finalGeneration);
    } catch (error) {
      console.error('Music generation error:', error);
      await storage.updateGeneration(generationId, {
        status: "error",
        error: error.message
      });
      broadcastUpdate('generation_error', { id: generationId, error: error.message });
    }
  }

  async function processVoiceGeneration(generationId: number, text: string, voice: string, style: string, speed: number) {
    try {
      const updateProgress = async (progress: number, status?: string) => {
        const generation = await storage.updateGeneration(generationId, { 
          progress, 
          ...(status && { status })
        });
        if (generation) {
          broadcastUpdate('generation_progress', generation);
        }
      };

      await updateProgress(20);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional voice synthesis director. Create a comprehensive voice production plan with timing, emphasis, and technical specifications. Respond with JSON in this format:
            {
              "segments": [{"text": "...", "timing": 0, "emphasis": "...", "pause": 0}],
              "voiceSettings": {"voice": "...", "style": "...", "speed": 0, "pitch": "...", "tone": "..."},
              "production": {"totalDuration": "...", "segmentCount": 0, "quality": "..."},
              "metadata": {"wordCount": 0, "estimatedDuration": "...", "complexity": "..."}
            }`
          },
          {
            role: "user",
            content: `Create voice synthesis for this text with ${voice} voice in ${style} style at ${speed}x speed: ${text}`
          },
        ],
        response_format: { type: "json_object" },
      });

      await updateProgress(90);

      const result = JSON.parse(response.choices[0].message.content || "{}");

      await updateProgress(100, "completed");

      const finalGeneration = await storage.updateGeneration(generationId, {
        status: "completed",
        result,
        progress: 100
      });

      const project = await storage.getProject(finalGeneration!.projectId);
      if (project) {
        await storage.updateProject(project.id, {
          status: "completed",
          content: result,
          progress: 100
        });
      }

      broadcastUpdate('generation_completed', finalGeneration);
    } catch (error) {
      console.error('Voice generation error:', error);
      await storage.updateGeneration(generationId, {
        status: "error",
        error: error.message
      });
      broadcastUpdate('generation_error', { id: generationId, error: error.message });
    }
  }

  async function processAnalysisGeneration(generationId: number, content: string, analysisType: string) {
    try {
      const updateProgress = async (progress: number, status?: string) => {
        const generation = await storage.updateGeneration(generationId, { 
          progress, 
          ...(status && { status })
        });
        if (generation) {
          broadcastUpdate('generation_progress', generation);
        }
      };

      await updateProgress(25);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional content analyst. Analyze the provided content and give detailed insights and recommendations. Respond with JSON in this format:
            {
              "analysis": {"summary": "...", "keyPoints": ["...", "..."], "strengths": ["...", "..."], "weaknesses": ["...", "..."]},
              "metrics": {"readability": 0, "engagement": 0, "sentiment": 0, "complexity": 0},
              "recommendations": [{"category": "...", "suggestion": "...", "priority": "..."}],
              "metadata": {"analysisType": "...", "contentLength": 0, "processingTime": "..."}
            }`
          },
          {
            role: "user",
            content: `Perform ${analysisType} analysis on this content: ${content}`
          },
        ],
        response_format: { type: "json_object" },
      });

      await updateProgress(95);

      const result = JSON.parse(response.choices[0].message.content || "{}");

      await updateProgress(100, "completed");

      const finalGeneration = await storage.updateGeneration(generationId, {
        status: "completed",
        result,
        progress: 100
      });

      const project = await storage.getProject(finalGeneration!.projectId);
      if (project) {
        await storage.updateProject(project.id, {
          status: "completed",
          content: result,
          progress: 100
        });
      }

      broadcastUpdate('generation_completed', finalGeneration);
    } catch (error) {
      console.error('Analysis generation error:', error);
      await storage.updateGeneration(generationId, {
        status: "error",
        error: error.message
      });
      broadcastUpdate('generation_error', { id: generationId, error: error.message });
    }
  }

  return httpServer;
}
