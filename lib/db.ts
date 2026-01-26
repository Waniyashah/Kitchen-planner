// Database configuration and utilities
// In production, connect to MongoDB, PostgreSQL, or your preferred database

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface KitchenProject {
  id: string
  userId: string
  name: string
  items: any[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  price: number
}

// Mock database functions - replace with actual database calls
export const db = {
  users: {
    create: async (user: Omit<User, "id" | "createdAt">) => {
      return { ...user, id: Date.now().toString(), createdAt: new Date() }
    },
    findByEmail: async (email: string) => {
      return null
    },
  },
  projects: {
    create: async (project: Omit<KitchenProject, "id" | "createdAt" | "updatedAt">) => {
      return {
        ...project,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },
    findByUserId: async (userId: string) => {
      return []
    },
    update: async (id: string, updates: Partial<KitchenProject>) => {
      return { ...updates, id, updatedAt: new Date() }
    },
  },
}
