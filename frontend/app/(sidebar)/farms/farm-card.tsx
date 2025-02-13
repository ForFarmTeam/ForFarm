import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Sprout, Plus } from "lucide-react";
import type { Farm } from "@/types";

export interface FarmCardProps {
  variant: "farm" | "add";
  farm?: Farm;
  onClick?: () => void;
}

export function FarmCard({ variant, farm, onClick }: FarmCardProps) {
  const cardClasses =
    "w-full max-w-[240px] bg-muted/50 hover:bg-muted/80 transition-all cursor-pointer group hover:shadow-lg";

  if (variant === "add") {
    return (
      <Card className={cardClasses} onClick={onClick}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-medium">Setup</h3>
              <p className="text-sm text-muted-foreground">Setup new farm</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "farm" && farm) {
    return (
      <Card className={cardClasses} onClick={onClick}>
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sprout className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">{farm.type}</span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium truncate">{farm.name}</h3>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <p className="text-sm">{farm.location}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Created {farm.createdAt.toLocaleDateString()}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
