export interface Crop {
  id: string;
  farmId: string;
  name: string;
  plantedDate: Date;
  status: "growing" | "harvested" | "planned";
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  type: string;
  createdAt: Date;
}
