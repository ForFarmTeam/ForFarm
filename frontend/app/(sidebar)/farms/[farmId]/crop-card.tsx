"use client";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Calendar, ArrowRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Cropland } from "@/types";

// ===================================================================
// Component Props: CropCard expects a cropland object and an optional click handler.
// ===================================================================
interface CropCardProps {
  crop: Cropland; // Crop data conforming to the Cropland type
  onClick?: () => void;
}

// ===================================================================
// Component: CropCard
// - Displays summary information about a crop, including status,
//   created date, and growth stage using an expressive card UI.
// ===================================================================
export function CropCard({ crop, onClick }: CropCardProps) {
  // ---------------------------------------------------------------
  // Status color mapping: Determines badge styling based on crop status.
  // Default colors provided for unknown statuses.
  // ---------------------------------------------------------------
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    growing: {
      bg: "bg-green-50 dark:bg-green-900",
      text: "text-green-600 dark:text-green-300",
      border: "border-green-200",
    },
    harvested: {
      bg: "bg-yellow-50 dark:bg-yellow-900",
      text: "text-yellow-600 dark:text-yellow-300",
      border: "border-yellow-200",
    },
    planned: {
      bg: "bg-blue-50 dark:bg-blue-900",
      text: "text-blue-600 dark:text-blue-300",
      border: "border-blue-200",
    },
    fallow: {
      bg: "bg-gray-50 dark:bg-gray-900",
      text: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200",
    },
    default: {
      bg: "bg-gray-100 dark:bg-gray-700",
      text: "text-gray-800 dark:text-gray-200",
      border: "border-gray-300",
    },
  };

  // ---------------------------------------------------------------
  // Derive styling based on crop status (ignoring case).
  // ---------------------------------------------------------------
  const statusKey = crop.status?.toLowerCase() || "default"; // Use camelCase status
  const statusColor = statusColors[statusKey] || statusColors.default;

  // ---------------------------------------------------------------
  // Format metadata for display: creation date and area.
  // ---------------------------------------------------------------
  const displayDate = crop.createdAt ? new Date(crop.createdAt).toLocaleDateString() : "N/A"; // Use camelCase createdAt
  const displayArea = typeof crop.landSize === "number" ? `${crop.landSize} ha` : "N/A"; // Use camelCase landSize

  // ===================================================================
  // Render: Crop information card with clickable behavior.
  // ===================================================================
  return (
    <Card
      onClick={onClick}
      className={`w-full h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg border-muted/60 bg-card dark:bg-card hover:bg-muted/10 dark:hover:bg-slate-700 cursor-pointer`}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`capitalize ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
            {crop.status || "Unknown"}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {displayDate}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-start gap-3">
          {/* ... icon ... */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1 line-clamp-1">{crop.name}</h3> {/* Use camelCase name */}
            <p className="text-sm text-muted-foreground mb-2">
              {crop.growthStage || "N/A"} • {displayArea} {/* Use camelCase growthStage */}
            </p>
            {crop.growthStage && (
              <div className="flex items-center mt-3 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" />
                  {/* Use camelCase growthStage */}
                  <span className="font-medium">Stage: {crop.growthStage}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto gap-1 text-primary hover:text-primary/80 hover:bg-primary/10">
          View details <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
