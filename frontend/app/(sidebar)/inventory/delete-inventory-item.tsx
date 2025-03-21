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
// import { deleteInventoryItem } from "@/api/inventory";
// import type { DeleteInventoryItemInput } from "@/types";

export function DeleteInventoryItem() {
  const [date, setDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemQuantity, setItemQuantity] = useState(0);
  const [itemUnit, setItemUnit] = useState("");

  // const queryClient = useQueryClient();

  const handleDelete = () => {
    // handle delete item
  };

  return (
    <Button type="submit" onClick={handleDelete}>
      Delete Item
    </Button>
  );
}
