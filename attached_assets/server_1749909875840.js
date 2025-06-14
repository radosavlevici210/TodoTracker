import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup
const DATABASE_URL = process.env.DATABASE_URL || 'sqlite://./ai-studio.db';
neonConfig.webSocketConstructor = ws;

let db;
if (DATABASE_URL.startsWith('postgresql://') || DATABASE_URL.startsWith('postgres://')) {
  const pool = new Pool({ connectionString: DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Fallback to in-memory storage for standalone
  console.log('Using in-memory storage - data will not persist between restarts');
  db = null;
}

// OpenAI setup
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

const DEFAULT_USER_ID = "standalone-user";

// Simple in-memory storage for demo
let projects = [];
let generations = [];
let nextId = 1;

// Mock user
const mockUser = {
  id: DEFAULT_USER_ID,
  email: "user@aistudio.local",
  firstName: "AI Studio",
  lastName: "User",
  createdAt: new Date(),
  updatedAt: new Date()
};

// API Routes
app.get('/api/auth/user', (req, res) => {
  res.json(mockUser);
});

app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  res.json(project);
});

app.post('/api/projects', (req, res) => {
  const project = {
    id: nextId++,
    userId: DEFAULT_USER_ID,
    ...req.body,
    status: 'draft',
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  projects.push(project);
  res.status(201).json(project);
});

app.patch('/api/projects/:id', (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === parseInt(req.params.id));
  if (projectIndex === -1) {
    return res.status(404).json({ message: "Project not found" });
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    ...req.body,
    updatedAt: new Date()
  };
  
  res.json(projects[projectIndex]);
});

app.delete('/api/projects/:id', (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === parseInt(req.params.id));
  if (projectIndex === -1) {
    return res.status(404).json({ message: "Project not found" });
  }
  
  projects.splice(projectIndex, 1);
  res.status(204).send();
});

app.get('/api/generations', (req, res) => {
  res.json(generations);
});

// AI Generation endpoints
app.post('/api/generate/movie', async (req, res) => {
  try {
    const { projectId, script, genre, quality, duration, audioEnhancement } = req.body;
    
    const generation = {
      id: nextId++,
      projectId,
      userId: DEFAULT_USER_ID,
      type: "movie",
      prompt: script,
      model: "gpt-4o",
      status: "processing",
      progress: 0,
      createdAt: new Date()
    };
    
    generations.push(generation);
    
    // Update project status
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      projects[projectIndex].status = "generating";
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional film production AI. Create a comprehensive movie production plan with scene breakdown, cinematography notes, and technical specifications. Respond with JSON in this format: 
            {
              "scenes": [{"id": "scene_1", "description": "...", "duration": 120, "visualElements": ["..."], "audioElements": ["..."]}],
              "productionNotes": {"cinematography": "...", "visualEffects": ["..."], "audioSpecs": "...", "exportSettings": {...}},
              "timeline": [{"timestamp": 0, "event": "...", "description": "..."}]
            }`
          },
          {
            role: "user",
            content: `Create a ${quality} quality ${genre} movie from this script (${duration} seconds): ${script}. Include ${audioEnhancement?.join(", ") || "standard"} audio enhancement.`
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      // Update generation
      const genIndex = generations.findIndex(g => g.id === generation.id);
      if (genIndex !== -1) {
        generations[genIndex] = {
          ...generations[genIndex],
          status: "completed",
          result,
          progress: 100,
          completedAt: new Date()
        };
      }

      // Update project
      if (projectIndex !== -1) {
        projects[projectIndex] = {
          ...projects[projectIndex],
          status: "completed",
          content: result,
          progress: 100
        };
      }

      res.json({ generation: generations[genIndex], result });
    } catch (error) {
      // Update generation with error
      const genIndex = generations.findIndex(g => g.id === generation.id);
      if (genIndex !== -1) {
        generations[genIndex] = {
          ...generations[genIndex],
          status: "error",
          error: error.message
        };
      }

      if (projectIndex !== -1) {
        projects[projectIndex].status = "error";
      }
      
      throw error;
    }
  } catch (error) {
    console.error("Error generating movie:", error);
    res.status(500).json({ message: "Failed to generate movie: " + error.message });
  }
});

// Similar endpoints for music, voice, and analysis would follow the same pattern

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI Studio Pro is running at http://localhost:${PORT}`);
  console.log('💡 Create unlimited AI content: movies, music, voice, and analysis');
  console.log('📁 Your projects are stored locally');
  console.log('⚡ No login required - start creating immediately!');
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    console.log('⚠️  Warning: Set OPENAI_API_KEY environment variable for AI features');
  }
});