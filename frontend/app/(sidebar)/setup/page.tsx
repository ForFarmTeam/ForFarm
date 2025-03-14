"use client";
import { useState } from "react";
import PlantingDetailsForm from "./planting-detail-form";
import HarvestDetailsForm from "./harvest-detail-form";
import GoogleMapWithDrawing from "@/components/google-map-with-drawing";
import { Separator } from "@/components/ui/separator";
import {
  plantingDetailsFormSchema,
  harvestDetailsFormSchema,
} from "@/schemas/application.schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";

type PlantingSchema = z.infer<typeof plantingDetailsFormSchema>;
type HarvestSchema = z.infer<typeof harvestDetailsFormSchema>;

const steps = [
  { title: "Step 1", description: "Planting Details" },
  { title: "Step 2", description: "Harvest Details" },
  { title: "Step 3", description: "Select Map Area" },
];

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [plantingDetails, setPlantingDetails] = useState<PlantingSchema | null>(
    null
  );
  const [harvestDetails, setHarvestDetails] = useState<HarvestSchema | null>(
    null
  );
  const [mapData, setMapData] = useState<{ lat: number; lng: number }[] | null>(
    null
  );

  const handleNext = () => {
    if (step === 1 && !plantingDetails) {
      alert("Please complete the Planting Details before proceeding.");
      return;
    }
    if (step === 2 && !harvestDetails) {
      alert("Please complete the Harvest Details before proceeding.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (!mapData) {
      alert("Please select an area on the map before submitting.");
      return;
    }

    console.log("Submitting:", { plantingDetails, harvestDetails, mapData });

    // send request to the server

  };

  return (
    <div className="p-5">
      {/* Stepper Navigation */}
      <div className="flex justify-between items-center mb-5">
        {steps.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${
                step === index + 1 ? "bg-blue-500" : "bg-gray-500"
              }`}
            >
              {index + 1}
            </div>
            <span className="font-medium mt-2">{item.title}</span>
            <span className="text-gray-500 text-sm">{item.description}</span>
          </div>
        ))}
      </div>

      <Separator className="mb-5" />

      {step === 1 && (
        <>
          <h2 className="text-xl text-center mb-5">Planting Details</h2>
          <PlantingDetailsForm onChange={setPlantingDetails} />
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl text-center mb-5">Harvest Details</h2>
          <HarvestDetailsForm onChange={setHarvestDetails} />
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-xl text-center mb-5">Select Area on Map</h2>
          <GoogleMapWithDrawing onAreaSelected={setMapData} />
        </>
      )}

      <div className="mt-10 flex justify-between">
        <Button onClick={handleBack} disabled={step === 1}>
          Back
        </Button>

        {step < 3 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Submit</Button>
        )}
      </div>
    </div>
  );
}
