"use client";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { MapPin, Sprout, Plus, ArrowRight, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Farm } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface FarmCardProps {
  variant: "farm" | "add";
  farm?: Farm; // Use updated Farm type
  onClick?: () => void;
  onEditClick?: (e: React.MouseEvent) => void; // Callback for edit
  onDeleteClick?: (e: React.MouseEvent) => void; // Callback for delete
}

export function FarmCard({ variant, farm, onClick, onEditClick, onDeleteClick }: FarmCardProps) {
  const cardClasses = cn(
    "w-full h-full overflow-hidden transition-all duration-200 hover:shadow-lg border",
    variant === "add"
      ? "bg-green-50/50 dark:bg-green-900/50 hover:bg-green-50/80 dark:hover:bg-green-900/80 border-dashed border-muted/60"
      : "bg-white dark:bg-slate-800 hover:bg-muted/10 dark:hover:bg-slate-700 border-muted/60"
  );

  // Stop propagation for dropdown menu trigger and items
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  if (variant === "add") {
    return (
      <Card className={cardClasses} onClick={onClick}>
        <div className="flex flex-col items-center justify-center h-full p-6 text-center cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-700 transition-colors">
            <Plus className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <h3 className="text-xl font-medium mb-2">Add New Farm</h3>
          <p className="text-sm text-muted-foreground">Create a new farm to manage your crops and resources</p>
        </div>
      </Card>
    );
  }

  if (variant === "farm" && farm) {
    // const formattedDate = new Intl.DateTimeFormat("en-US", {
    //   year: "numeric",
    //   month: "short",
    //   day: "numeric",
    // }).format(new Date(farm.createdAt));

    return (
      <Card className={cardClasses}>
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className="capitalize bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 flex-shrink-0">
              {farm.farmType}
            </Badge>
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={stopPropagation}>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-muted/50">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Farm Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={stopPropagation}>
                <DropdownMenuItem onClick={onEditClick}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Farm</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={onDeleteClick}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Farm</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        {/* Use div for clickable area if needed, or rely on button */}
        <div className="flex-grow cursor-pointer" onClick={onClick}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center bg-muted/40">
                <Sprout className="h-5 w-5 text-primary" />
              </div>
              {/* Ensure text truncates */}
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-medium mb-1 truncate" title={farm.name}>
                  {farm.name}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2 truncate">
                  <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  {/* Display truncated location or just Lat/Lon */}
                  <span className="truncate" title={`Lat: ${farm.lat}, Lon: ${farm.lon}`}>
                    Lat: {farm.lat.toFixed(3)}, Lon: {farm.lon.toFixed(3)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-muted/30 dark:bg-muted/20 rounded-md p-2 text-center">
                    <p className="text-xs text-muted-foreground">Area</p>
                    <p className="font-medium truncate" title={farm.totalSize || "N/A"}>
                      {farm.totalSize || "N/A"}
                    </p>
                  </div>
                  <div className="bg-muted/30 dark:bg-muted/20 rounded-md p-2 text-center">
                    <p className="text-xs text-muted-foreground">Crops</p>
                    <p className="font-medium">{farm.crops ? farm.crops.length : 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
        <CardFooter className="p-4 pt-0 mt-auto">
          {" "}
          {/* Keep footer outside clickable area */}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto gap-1 text-primary hover:text-primary/80 hover:bg-primary/10"
            onClick={onClick}>
            View details <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
}
