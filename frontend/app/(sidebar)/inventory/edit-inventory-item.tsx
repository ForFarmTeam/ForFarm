"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InventoryItemStatus,
  InventoryItemCategory,
  HarvestUnits,
} from "@/types";
// import { updateInventoryItem } from "@/api/inventory";
// import type { UpdateInventoryItemInput } from "@/types";

export interface EditInventoryItemProps {
  id: string;
  name: string;
  category: string;
  status: string;
  unit: string;
  quantity: number;
  fetchedInventoryStatus: InventoryItemStatus[];
  fetchedInventoryCategory: InventoryItemCategory[];
  fetchedHarvestUnits: HarvestUnits[];
}

export function EditInventoryItem({
  id,
  name,
  category,
  status,
  unit,
  quantity,
  fetchedInventoryStatus,
  fetchedInventoryCategory,
  fetchedHarvestUnits,
}: EditInventoryItemProps) {
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState(name);
  const [itemCategory, setItemCategory] = useState(category);
  const [itemQuantity, setItemQuantity] = useState(quantity);
  const [itemUnit, setItemUnit] = useState(unit);
  const [itemStatus, setItemStatus] = useState(status);

  // const queryClient = useQueryClient();

  // const mutation = useMutation({
  //   mutationFn: (item: UpdateInventoryItemInput) => UpdateInventoryItem(item),
  //   onSuccess: () => {
  //     // Invalidate queries to refresh inventory data.
  //     queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
  //     // Reset form fields and close dialog.
  //     setItemName("");
  //     setItemType("");
  //     setItemCategory("");
  //     setItemQuantity(0);
  //     setItemUnit("");
  //     setDate(undefined);
  //     setOpen(false);
  //   },
  // });

  const handleEdit = () => {
    //   // Basic validation (you can extend this as needed)
    //   if (!itemName || !itemType || !itemCategory || !itemUnit) return;
    //   mutation.mutate({
    //     name: itemName,
    //     type: itemType,
    //     category: itemCategory,
    //     quantity: itemQuantity,
    //     unit: itemUnit,
    //   });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-500 hover:bg-yellow-600">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogDescription>
            Edit a plantation or fertilizer item in your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Category
            </Label>
            <Select value={itemCategory} onValueChange={setItemCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  {fetchedInventoryCategory.map((categoryItem, _) => (
                    <SelectItem key={categoryItem.id} value={categoryItem.name}>
                      {categoryItem.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Status
            </Label>
            <Select value={itemStatus} onValueChange={setItemStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  {fetchedInventoryStatus.map((statusItem, _) => (
                    <SelectItem key={statusItem.id} value={statusItem.name}>
                      {statusItem.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              className="col-span-3"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Unit
            </Label>
            <Select value={itemUnit} onValueChange={setItemUnit}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Unit</SelectLabel>
                  {fetchedHarvestUnits.map((unit, _) => (
                    <SelectItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleEdit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
