"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createInventoryItem } from "@/api/inventory";
import type {
  CreateInventoryItemInput,
  InventoryStatus,
  InventoryItemCategory,
  HarvestUnits,
} from "@/types";

interface AddInventoryItemProps {
  inventoryCategory: InventoryItemCategory[];
  inventoryStatus: InventoryStatus[];
  harvestUnits: HarvestUnits[];
}

export function AddInventoryItem({
  inventoryCategory,
  inventoryStatus,
  harvestUnits,
}: AddInventoryItemProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemQuantity, setItemQuantity] = useState(0);
  const [itemUnit, setItemUnit] = useState("");
  const [itemStatus, setItemStatus] = useState("");

  const mutation = useMutation({
    mutationFn: (item: CreateInventoryItemInput) => createInventoryItem(item),
    onSuccess: () => {
      // invalidate queries to refresh inventory data.
      const queryClient = useQueryClient();
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      // reset form fields and close dialog.
      setItemName("");
      setItemCategory("");
      setItemQuantity(0);
      setItemUnit("");
      setDate(undefined);
      setOpen(false);
    },
  });

  const inputStates = [itemName, itemCategory, itemUnit, itemStatus, date];
  const isInputValid = inputStates.every((input) => input);

  const handleSave = () => {
    if (!isInputValid) {
      console.error("All fields are required");
      return;
    }

    const newItem: CreateInventoryItemInput = {
      name: itemName,
      categoryId:
        inventoryCategory.find((item) => item.name === itemCategory)?.id || 0,
      quantity: itemQuantity,
      unitId: harvestUnits.find((item) => item.name === itemUnit)?.id || 0,
      statusId:
        inventoryStatus.find((item) => item.name === itemStatus)?.id || 0,
      lastUpdated: date ? date.toISOString() : new Date().toISOString(),
    };
    console.table(newItem);
    mutation.mutate(newItem);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
          <DialogDescription>
            Add a new plantation or fertilizer item to your inventory.
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
                  {inventoryCategory.map((categoryItem, _) => (
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
                  {inventoryStatus.map((statusItem, _) => (
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
              value={itemQuantity === 0 ? "" : itemQuantity}
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
                  {harvestUnits.map((unit, _) => (
                    <SelectItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
