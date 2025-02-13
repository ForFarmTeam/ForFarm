"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FarmCard } from "./farm-card";
import { AddFarmForm } from "./add-farm-form";
import type { Farm } from "@/types";

export default function FarmSetupPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [farms, setFarms] = useState<Farm[]>([
    {
      id: "1",
      name: "Green Valley Farm",
      location: "Bangkok",
      type: "durian",
      createdAt: new Date(),
    },
  ]);

  const handleAddFarm = async (data: Partial<Farm>) => {
    const newFarm: Farm = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name!,
      location: data.location!,
      type: data.type!,
      createdAt: new Date(),
    };
    setFarms([...farms, newFarm]);
    setIsDialogOpen(false);
  };

  const filteredFarms = farms.filter(
    (farm) =>
      farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container max-w-screen-xl p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Farms</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search farms..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Separator className="my-4" />

      <div className="grid grid-cols-5 gap-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <FarmCard variant="add" onClick={() => setIsDialogOpen(true)} />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Setup New Farm</DialogTitle>
              <DialogDescription>Fill out the form to configure your new farm.</DialogDescription>
            </DialogHeader>
            <AddFarmForm onSubmit={handleAddFarm} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        {filteredFarms.map((farm) => (
          <FarmCard key={farm.id} variant="farm" farm={farm} />
        ))}
      </div>
    </div>
  );
}
