export interface GeoPosition {
  lat: number;
  lng: number;
}

export interface GeoMarker {
  type: "marker";
  position: GeoPosition;
}

export interface GeoPolygon {
  type: "polygon";
  path: GeoPosition[];
}

export interface GeoPolyline {
  type: "polyline";
  path: GeoPosition[];
}

export type GeoFeatureData = GeoMarker | GeoPolygon | GeoPolyline;

export interface Plant {
  uuid: string;
  name: string;
  variety?: string;
  averageHeight?: number;
  daysToEmerge?: number;
  daysToFlower?: number;
  daysToMaturity?: number;
  estimateLossRate?: number;
  estimateRevenuePerHu?: number;
  harvestUnitId: number;
  harvestWindow?: number;
  isPerennial: boolean;
  lightProfileId: number;
  optimalTemp?: number;
  phValue?: number;
  plantingDepth?: number;
  plantingDetail?: string;
  rowSpacing?: number;
  soilConditionId: number;
  waterNeeds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cropland {
  uuid: string;
  name: string;
  status: string;
  priority: number;
  landSize: number;
  growthStage: string;
  plantId: string;
  farmId: string;
  geoFeature?: GeoFeatureData | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CropAnalytics {
  cropId: string;
  cropName: string;
  farmId: string;
  plantName: string;
  variety?: string;
  currentStatus: string;
  growthStage: string;
  landSize: number;
  lastUpdated: string;
  temperature?: number | null;
  humidity?: number | null;
  soilMoisture?: number | null;
  sunlight?: number | null;
  windSpeed?: number | null;
  rainfall?: number | null;
  growthProgress: number;
  plantHealth?: "good" | "warning" | "critical";
  nextAction?: string | null;
  nextActionDue?: string | null;
  nutrientLevels?: {
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
  } | null;
}

export interface Farm {
  uuid: string;
  name: string;
  farmType: string;
  lat: number;
  lon: number;
  ownerId: string;
  totalSize: string;
  createdAt: Date;
  updatedAt: Date;
  crops: Cropland[];
}

export interface User {
  id: number;
  uuid: string;
  username?: string;
  password?: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  categoryId: number;
  category: { id: number; name: string };
  quantity: number;
  unitId: number;
  unit: { id: number; name: string };
  dateAdded: string;
  statusId: number;
  status: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStatus {
  id: number;
  name: string;
}

export interface InventoryCategory {
  id: number;
  name: string;
}

export interface HarvestUnit {
  id: number;
  name: string;
}

export type InventoryItemCategory = {
  id: number;
  name: string;
};
export type HarvestUnits = {
  id: number;
  name: string;
};

export type CreateInventoryItemInput = {
  name: string;
  categoryId: number;
  quantity: number;
  unitId: number;
  dateAdded: string;
  statusId: number;
};

// export type UpdateInventoryItemInput = CreateInventoryItemInput & {};
export type EditInventoryItemInput = CreateInventoryItemInput;

export type UpdateInventoryItemInput = Partial<CreateInventoryItemInput> & {
  id: string;
};

export interface Blog {
  id: string;
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
    id: string;
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

export interface KnowledgeArticle {
  UUID: string;
  Title: string;
  Content: string;
  Author: string;
  PublishDate: string;
  ReadTime: string;
  Categories: string[];
  ImageURL: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface TableOfContent {
  UUID: string;
  ArticleID: string;
  Title: string;
  Level: number;
  Order: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface RelatedArticle {
  UUID: string;
  ArticleID: string;
  RelatedTitle: string;
  RelatedTag: string;
  CreatedAt: string;
  UpdatedAt: string;
}
