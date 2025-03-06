"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Crop } from "@/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import GoogleMapWithDrawing from "@/components/google-map-with-drawing";

interface Plant {
  id: string;
  name: string;
  image: string;
  growthTime: string;
}

const plants: Plant[] = [
  {
    id: "durian",
    name: "Durian",
    image: "/placeholder.svg?height=80&width=80",
    growthTime: "4-5 months",
  },
  {
    id: "mango",
    name: "Mango",
    image: "/placeholder.svg?height=80&width=80",
    growthTime: "3-4 months",
  },
  {
    id: "coconut",
    name: "Coconut",
    image: "/placeholder.svg?height=80&width=80",
    growthTime: "5-6 months",
  },
];

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Crop>) => Promise<void>;
}

export function CropDialog({ open, onOpenChange, onSubmit }: CropDialogProps) {
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [location, setLocation] = useState({ lat: 13.7563, lng: 100.5018 }); // Bangkok coordinates

  const handleSubmit = async () => {
    if (!selectedPlant) return;

    await onSubmit({
      name: plants.find((p) => p.id === selectedPlant)?.name || "",
      plantedDate: new Date(),
      status: "planned",
    });

    setSelectedPlant(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>
      <DialogContent className="sm:max-w-[900px] p-0">
        <div className="grid md:grid-cols-2 h-[600px]">
          {/* Left side - Plant Selection */}
          <div className="p-6 overflow-y-auto border-r dark:border-slate-700">
            <h2 className="text-lg font-semibold mb-4">Select Plant to Grow</h2>
            <div className="space-y-4">
              {plants.map((plant) => (
                <Card
                  key={plant.id}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors",
                    selectedPlant === plant.id && "border-primary dark:border-primary dark:bg-primary/5 bg-primary/5"
                  )}
                  onClick={() => setSelectedPlant(plant.id)}>
                  <div className="flex items-center gap-4">
                    <img
                      src={plant.image || "/placeholder.svg"}
                      alt={plant.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{plant.name}</h3>
                        {selectedPlant === plant.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">Growth time: {plant.growthTime}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right side - Map */}
          <div className="relative">
            <div className="absolute inset-0 bg-muted/10 dark:bg-muted/20">
              <div className="h-full w-full flex items-center justify-center">
                <GoogleMapWithDrawing />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background dark:bg-background border-t dark:border-slate-700">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!selectedPlant}>
                Plant Crop
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
