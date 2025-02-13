import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sprout, Calendar } from "lucide-react";
import { Crop } from "@/types";

interface CropCardProps {
  crop: Crop;
}

export function CropCard({ crop }: CropCardProps) {
  const statusColors = {
    growing: "text-green-500",
    harvested: "text-yellow-500",
    planned: "text-blue-500",
  };

  return (
    <Card className="w-full bg-muted/50 hover:bg-muted/80 transition-all cursor-pointer group hover:shadow-lg">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sprout className="h-4 w-4 text-primary" />
          </div>
          <span className={`text-sm font-medium capitalize ${statusColors[crop.status]}`}>{crop.status}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium truncate">{crop.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <p>Planted: {crop.plantedDate.toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
