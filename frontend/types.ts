export interface Crop {
  id: string;
  farmId: string;
  name: string;
  plantedDate: Date;
  expectedHarvest?: Date;
  status: string;
  variety?: string;
  area?: string;
  healthScore?: number;
  progress?: number;
}

export interface CropAnalytics {
  cropId: string;
  growthProgress: number;
  humidity: number;
  temperature: number;
  sunlight: number;
  waterLevel: number;
  plantHealth: "good" | "warning" | "critical";
  nextAction: string;
  nextActionDue: Date;
  soilMoisture: number;
  windSpeed: string;
  rainfall: string;
  nutrientLevels: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  type: string;
  createdAt: Date;
  area?: string;
  crops: number;
  weather?: {
    temperature: number;
    humidity: number;
    rainfall: string;
    sunlight: number;
  };
}

export interface User {
  ID: number;
  UUID: string;
  Username: string;
  Password: string;
  Email: string;
  CreatedAt: string;
  UpdatedAt: string;
  Avatar: string;
  IsActive: boolean;
}

export type InventoryItem = {
  id: number;
  name: string;
  category: string;
  type: string;
  quantity: number;
  unit: string;
  lastUpdated: string;
  status: string;
};

export type CreateInventoryItemInput = Omit<InventoryItem, "id" | "lastUpdated" | "status">;

export interface Blog {
  id: number;
  title: string;
  description: string;
  date: string;
  author: string;
  topic: string;
  image: string;
  readTime: string;
  featured: boolean;
  content?: string;
  tableOfContents?: { id: string; title: string; level: number }[];
  relatedArticles?: {
    id: number;
    title: string;
    topic: string;
    image: string;
    description?: string;
    date?: string;
    author?: string;
    readTime?: string;
    featured?: boolean;
  }[];
}
