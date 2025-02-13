"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Plus, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CropDialog } from "./crop-dialog";
import { CropCard } from "./crop-card";
import { Farm, Crop } from "@/types";
import React from "react";

const crops: Crop[] = [
  {
    id: "1",
    farmId: "1",
    name: "Monthong Durian",
    plantedDate: new Date("2023-03-15"),
    status: "growing",
  },
  {
    id: "2",
    farmId: "1",
    name: "Chanee Durian",
    plantedDate: new Date("2023-02-20"),
    status: "planned",
  },
  {
    id: "3",
    farmId: "2",
    name: "Kradum Durian",
    plantedDate: new Date("2022-11-05"),
    status: "harvested",
  },
];

const farms: Farm[] = [
  {
    id: "1",
    name: "Green Valley Farm",
    location: "Bangkok",
    type: "durian",
    createdAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    name: "Golden Farm",
    location: "Chiang Mai",
    type: "mango",
    createdAt: new Date("2022-12-01"),
  },
];

const getFarmById = (id: string): Farm | undefined => {
  return farms.find((farm) => farm.id === id);
};

const getCropsByFarmId = (farmId: string): Crop[] => crops.filter((crop) => crop.farmId === farmId);

export default function FarmDetailPage({ params }: { params: Promise<{ farmId: string }> }) {
  const { farmId } = React.use(params);

  const router = useRouter();
  const [farm] = useState<Farm | undefined>(getFarmById(farmId));
  const [crops, setCrops] = useState<Crop[]>(getCropsByFarmId(farmId));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCrop = async (data: Partial<Crop>) => {
    const newCrop: Crop = {
      id: Math.random().toString(36).substr(2, 9),
      farmId: farm!.id,
      name: data.name!,
      plantedDate: data.plantedDate!,
      status: data.status!,
    };
    setCrops((prevCrops) => [...prevCrops, newCrop]);
    // When the crop gets added, close the dialog
    setIsDialogOpen(false);
  };

  return (
    <div className="container max-w-screen-xl p-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farms
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sprout className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{farm?.name ?? "Unknown Farm"}</h1>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {farm?.location ?? "Unknown Location"}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="font-medium">Farm Type:</span>
                <span className="text-muted-foreground">{farm?.type ?? "Unknown Type"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span className="text-muted-foreground">{farm?.createdAt?.toLocaleDateString() ?? "Unknown Date"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Crops:</span>
                <span className="text-muted-foreground">{crops.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Crops</h2>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Clickable "Add Crop" Card */}
            <Card
              className="w-full bg-muted/50 hover:bg-muted/80 transition-all cursor-pointer group hover:shadow-lg"
              onClick={() => setIsDialogOpen(true)}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-medium">Add Crop</h3>
                    <p className="text-sm text-muted-foreground">Plant a new crop</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Crop Dialog */}
            <CropDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleAddCrop} />

            {crops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onClick={() => {
                  router.push(`/farms/${crop.farmId}/crops/${crop.id}`);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
