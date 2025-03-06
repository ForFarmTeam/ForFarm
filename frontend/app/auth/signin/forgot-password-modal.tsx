import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordModal() {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="whitespace-nowrap flex bg-transparent border-none hover:bg-transparent shadow-none">
            <h1 className="text-green-600 underline">Forgot password?</h1>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>What&apos;s your email?</DialogTitle>
            <DialogDescription>
              Please verify your email for us. Once you do, we&apos;ll send instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Email
              </Label>
              <Input id="email" type="email" placeholder="your.email@gmail.com" />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button">RESET MY PASSWORD</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
