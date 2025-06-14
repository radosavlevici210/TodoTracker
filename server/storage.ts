import { projects, generations, users, type User, type InsertUser, type Project, type InsertProject, type Generation, type InsertGeneration } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Generation operations
  getGenerations(userId: string): Promise<Generation[]>;
  getGeneration(id: number): Promise<Generation | undefined>;
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  updateGeneration(id: number, updates: Partial<Generation>): Promise<Generation | undefined>;
  getActiveGenerations(userId: string): Promise<Generation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<number, Project>;
  private generations: Map<number, Generation>;
  private currentProjectId: number;
  private currentGenerationId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.generations = new Map();
    this.currentProjectId = 1;
    this.currentGenerationId = 1;

    // Create default user for standalone mode
    const defaultUser: User = {
      id: "standalone-user",
      email: "user@aistudio.local",
      firstName: "AI Studio",
      lastName: "User",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: `user-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async getProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const project: Project = {
      ...insertProject,
      id: this.currentProjectId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(project.id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date()
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getGenerations(userId: string): Promise<Generation[]> {
    return Array.from(this.generations.values())
      .filter(generation => generation.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGeneration(id: number): Promise<Generation | undefined> {
    return this.generations.get(id);
  }

  async createGeneration(insertGeneration: InsertGeneration): Promise<Generation> {
    const generation: Generation = {
      ...insertGeneration,
      id: this.currentGenerationId++,
      createdAt: new Date(),
      completedAt: null
    };
    this.generations.set(generation.id, generation);
    return generation;
  }

  async updateGeneration(id: number, updates: Partial<Generation>): Promise<Generation | undefined> {
    const generation = this.generations.get(id);
    if (!generation) return undefined;

    const updatedGeneration: Generation = {
      ...generation,
      ...updates,
      completedAt: updates.status === 'completed' ? new Date() : generation.completedAt
    };
    this.generations.set(id, updatedGeneration);
    return updatedGeneration;
  }

  async getActiveGenerations(userId: string): Promise<Generation[]> {
    return Array.from(this.generations.values())
      .filter(generation => 
        generation.userId === userId && 
        (generation.status === 'processing' || generation.status === 'pending')
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
