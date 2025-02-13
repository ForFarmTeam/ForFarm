import PlantingDetailsForm from "./planting-detail-form";
import { Separator } from "@/components/ui/separator";

export default function SetupPage() {
  return (
    <div className="p-5">
      <h1 className="text-2xl">Plating Details</h1>
      <Separator className="mt-3" />
      <div className="mt-3">
        <PlantingDetailsForm />
      </div>
    </div>
  );
}
