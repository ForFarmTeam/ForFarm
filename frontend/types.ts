export interface Crop {
  id: string;
  farmId: string;
  name: string;
  plantedDate: Date;
  status: "growing" | "harvested" | "planned";
}

export interface CropAnalytics {
  cropId: string;
  humidity: number;
  temperature: number;
  sunlight: number;
  waterLevel: number;
  growthProgress: number;
  plantHealth: "good" | "warning" | "critical";
  nextAction: string;
  nextActionDue: Date;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  type: string;
  createdAt: Date;
}

export interface User {
  ID: number;
  UUID: string;
  Username: string;
  Password: string;
  Email: string;
  CreatedAt: string;
  UpdatedAt: string;
  IsActive: boolean;
}
