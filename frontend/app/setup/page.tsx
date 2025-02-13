import PlantingDetailsForm from "./planting-detail-form";
import HarvestDetailsForm from "./harvest-detail-form";
import { Separator } from "@/components/ui/separator";
import GoogleMapWithDrawing from "./google-map-with-drawing";

export default function SetupPage() {
  return (
    <div className="p-5">
      <div className=" flex justify-center">
        <h1 className="flex text-2xl ">Plating Details</h1>
      </div>
      <Separator className="mt-3" />
      <div className="mt-10 flex justify-center">
        <PlantingDetailsForm />
      </div>
      <div className=" flex justify-center mt-20">
        <h1 className="flex text-2xl ">Harvest Details</h1>
      </div>
      <Separator className="mt-3" />
      <div className="mt-10 flex justify-center">
        <HarvestDetailsForm />
      </div>
      <div className="mt-10">
        <div className=" flex justify-center mt-20">
          <h1 className="flex text-2xl ">Map</h1>
        </div>
        <Separator className="mt-3" />
        <div className="mt-10">
          <GoogleMapWithDrawing />
        </div>
      </div>
    </div>
  );
}
