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
  InventoryStatus,
  InventoryItemCategory,
  HarvestUnits,
  UpdateInventoryItemInput,
  EditInventoryItemInput,
} from "@/types";
import { updateInventoryItem } from "@/api/inventory";

export function EditInventoryItem({
  item,
  fetchedInventoryStatus,
  fetchedInventoryCategory,
  fetchedHarvestUnits,
}: {
  item: UpdateInventoryItemInput;
  fetchedInventoryStatus: InventoryStatus[];
  fetchedInventoryCategory: InventoryItemCategory[];
  fetchedHarvestUnits: HarvestUnits[];
}) {
  // console.table(item);
  // console.log(item.id);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState(item.name);
  const [itemCategory, setItemCategory] = useState(
    fetchedInventoryCategory.find((x) => x.id === item.categoryId)?.name
  );

  const [itemQuantity, setItemQuantity] = useState(item.quantity);

  const [itemUnit, setItemUnit] = useState(
    fetchedHarvestUnits.find((x) => x.id === item.unitId)?.name
  );

  const [itemStatus, setItemStatus] = useState(
    fetchedInventoryStatus.find((x) => x.id === item.statusId)?.name
  );
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (x: EditInventoryItemInput) => updateInventoryItem(item.id, x),
    onSuccess: () => {
      // invalidate queries to refresh inventory data.
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      // reset form fields and close dialog.
      setItemName("");
      setItemCategory("");
      setItemQuantity(0);
      setItemUnit("");
      setOpen(false);
      setItemStatus("");
    },
  });

  // send edit request
  const handleEdit = () => {
    if (!itemName || !itemCategory || !itemUnit) {
      setError("All fields are required. Please fill in missing details.");
      return;
    }

    const category = fetchedInventoryCategory.find(
      (c) => c.name === itemCategory
    );
    const unit = fetchedHarvestUnits.find((u) => u.name === itemUnit);
    const status = fetchedInventoryStatus.find((s) => s.name === itemStatus);

    if (!category || !unit || !status) {
      setError(
        "Invalid category, unit, or status. Please select a valid option."
      );
      return;
    }
    // console.log("Mutate called");
    console.log(item.id);
    mutation.mutate({
      name: itemName,
      categoryId: item.categoryId ?? 0,
      quantity: itemQuantity ?? 0,
      unitId:
        fetchedHarvestUnits.find((unit) => unit.name === itemUnit)?.id ?? 0,
      statusId:
        fetchedInventoryStatus.find((status) => status.name === itemStatus)
          ?.id ?? 0,
      dateAdded: new Date().toISOString(),
    });
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" onClick={handleEdit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
