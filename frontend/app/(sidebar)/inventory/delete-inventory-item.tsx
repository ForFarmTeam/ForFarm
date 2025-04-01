import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteInventoryItem({ id }: { id: string }) {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    console.log(`Item with ID ${id} deleted.`);
    setOpen(false);
  };

  return (
    <div>
      {/* trigger button for the confirmation dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="bg-red-500 hover:bg-red-800 text-white"
          >
            Delete Item
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </DialogDescription>

          {/* footer with confirm and cancel buttons */}
          <DialogFooter>
            <Button
              className="bg-gray-500 hover:bg-gray-700 text-white"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-800 text-white"
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
