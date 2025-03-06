"use client";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Sprout, Calendar, ArrowRight, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Crop } from "@/types";

interface CropCardProps {
  crop: Crop;
  onClick?: () => void;
}

export function CropCard({ crop, onClick }: CropCardProps) {
  const statusColors = {
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
  };

  const statusColor = statusColors[crop.status as keyof typeof statusColors];

  return (
    <Card
      onClick={onClick}
      className={`w-full h-full overflow-hidden transition-all duration-200 hover:shadow-lg border-muted/60 bg-white dark:bg-slate-800 hover:bg-muted/10 dark:hover:bg-slate-700`}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`capitalize ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
            {crop.status}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {crop.plantedDate.toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-full ${statusColor.bg} flex-shrink-0 flex items-center justify-center`}>
            <Sprout className={`h-5 w-5 ${statusColor.text}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-medium mb-1">{crop.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {crop.variety} • {crop.area}
            </p>

            {crop.status !== "planned" && (
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{crop.progress}%</span>
                </div>
                <Progress
                  value={crop.progress}
                  className={`h-2 ${
                    crop.status === "growing" ? "bg-green-500" : crop.status === "harvested" ? "bg-yellow-500" : ""
                  }`}
                />
              </div>
            )}

            {crop.status === "growing" && (
              <div className="flex items-center mt-3 text-sm">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-300">
                  <BarChart className="h-3.5 w-3.5" />
                  <span className="font-medium">Health: {crop.healthScore}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto gap-1 text-green-600 dark:text-green-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-800">
          View details <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
