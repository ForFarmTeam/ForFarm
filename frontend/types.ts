export interface Plant {
  UUID: string;
  Name: string;
  Variety: string;
  AverageHeight: number;
  DaysToEmerge: number;
  DaysToFlower: number;
  DaysToMaturity: number;
  EstimateLossRate: number;
  EstimateRevenuePerHU: number;
  HarvestUnitID: number;
  HarvestWindow: number;
  IsPerennial: boolean;
  LightProfileID: number;
  OptimalTemp: number;
  PHValue: number;
  PlantingDepth: number;
  PlantingDetail: string;
  RowSpacing: number;
  SoilConditionID: number;
  WaterNeeds: number;
  CreatedAt: string;
  UpdatedAt: string;
}

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

export interface Cropland {
  UUID: string;
  Name: string;
  Status: string;
  Priority: number;
  LandSize: number;
  GrowthStage: string;
  PlantID: string;
  FarmID: string;
  CreatedAt: Date;
  UpdatedAt: Date;
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
  CreatedAt: Date;
  FarmType: string;
  Lat: number;
  Lon: number;
  Name: string;
  OwnerID: string;
  TotalSize: string;
  UUID: string;
  UpdatedAt: Date;
  Crops: Cropland[];
}

// export interface Farm {
//   id: string;
//   name: string;
//   location: string;
//   type: string;
//   createdAt: Date;
//   area?: string;
//   crops: number;
//   weather?: {
//     temperature: number;
//     humidity: number;
//     rainfall: string;
//     sunlight: number;
//   };
// }

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
export type InventoryItemStatus = {
  id: number;
  name: string;
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

// ----------- Maps -----------$

export type OverlayGeometry =
  | google.maps.Marker
  | google.maps.Polygon
  | google.maps.Polyline
  | google.maps.Rectangle
  | google.maps.Circle;

export interface DrawResult {
  type: google.maps.drawing.OverlayType;
  overlay: OverlayGeometry;
}

export interface Snapshot {
  radius?: number;
  center?: google.maps.LatLngLiteral;
  position?: google.maps.LatLngLiteral;
  path?: Array<google.maps.LatLng>;
  bounds?: google.maps.LatLngBoundsLiteral;
}

export interface Overlay {
  type: google.maps.drawing.OverlayType;
  geometry: OverlayGeometry;
  snapshot: Snapshot;
}

export interface State {
  past: Array<Array<Overlay>>;
  now: Array<Overlay>;
  future: Array<Array<Overlay>>;
}

export enum DrawingActionKind {
  SET_OVERLAY = "SET_OVERLAY",
  UPDATE_OVERLAYS = "UPDATE_OVERLAYS",
  UNDO = "UNDO",
  REDO = "REDO",
}

export interface ActionWithTypeOnly {
  type: Exclude<DrawingActionKind, DrawingActionKind.SET_OVERLAY>;
}

export interface SetOverlayAction {
  type: DrawingActionKind.SET_OVERLAY;
  payload: DrawResult;
}

export type Action = ActionWithTypeOnly | SetOverlayAction;

export function isCircle(overlay: OverlayGeometry): overlay is google.maps.Circle {
  return (overlay as google.maps.Circle).getCenter !== undefined;
}

export function isMarker(overlay: OverlayGeometry): overlay is google.maps.Marker {
  return (overlay as google.maps.Marker).getPosition !== undefined;
}

export function isPolygon(overlay: OverlayGeometry): overlay is google.maps.Polygon {
  return (overlay as google.maps.Polygon).getPath !== undefined;
}

export function isPolyline(overlay: OverlayGeometry): overlay is google.maps.Polyline {
  return (overlay as google.maps.Polyline).getPath !== undefined;
}

export function isRectangle(overlay: OverlayGeometry): overlay is google.maps.Rectangle {
  return (overlay as google.maps.Rectangle).getBounds !== undefined;
}
