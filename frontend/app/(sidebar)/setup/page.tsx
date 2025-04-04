"use client";
import { SetStateAction, useEffect, useState } from "react";
import PlantingDetailsForm from "./planting-detail-form";
import HarvestDetailsForm from "./harvest-detail-form";
import { Separator } from "@/components/ui/separator";
import GoogleMapWithDrawing from "@/components/google-map-with-drawing";
import {
  plantingDetailsFormSchema,
  harvestDetailsFormSchema,
} from "@/schemas/application.schema";
import { z } from "zod";

type plantingSchema = z.infer<typeof plantingDetailsFormSchema>;
type harvestSchema = z.infer<typeof harvestDetailsFormSchema>;

export default function SetupPage() {
  const [plantingDetails, setPlantingDetails] = useState<plantingSchema | null>(
    null
  );
  const [harvestDetails, setHarvestDetails] = useState<harvestSchema | null>(
    null
  );
  const [mapData, setMapData] = useState<{ lat: number; lng: number }[] | null>(
    null
  );

  // handle planting details submission
  const handlePlantingDetailsChange = (data: plantingSchema) => {
    setPlantingDetails(data);
  };

  // handle harvest details submission
  const handleHarvestDetailsChange = (data: harvestSchema) => {
    setHarvestDetails(data);
  };

  // handle map area selection
  const handleMapDataChange = (data: { lat: number; lng: number }[]) => {
    setMapData((prevMapData) => {
      if (prevMapData) {
        return [...prevMapData, ...data];
      } else {
        return data;
      }
    });
  };

  // log the changes
  useEffect(() => {
    // console.log(plantingDetails);
    // console.log(harvestDetails);
    console.table(mapData);
  }, [plantingDetails, harvestDetails, mapData]);

  const handleSubmit = () => {
    if (!plantingDetails || !harvestDetails || !mapData) {
      alert("Please complete all sections before submitting.");
      return;
    }

    const formData = {
      plantingDetails,
      harvestDetails,
      mapData,
    };

    console.log("Form data to be submitted:", formData);

    fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from backend:", data);
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
      });
  };

  return (
    <div className="p-5">
      {/* Planting Details Section */}
      <div className="flex justify-center">
        <h1 className="text-2xl">Planting Details</h1>
      </div>
      <Separator className="mt-3" />
      <div className="mt-10 flex justify-center">
        <PlantingDetailsForm onChange={handlePlantingDetailsChange} />
      </div>

      {/* Harvest Details Section */}
      <div className="flex justify-center mt-20">
        <h1 className="text-2xl">Harvest Details</h1>
      </div>
      <Separator className="mt-3" />
      <div className="mt-10 flex justify-center">
        <HarvestDetailsForm onChange={handleHarvestDetailsChange} />
      </div>

      {/* Map Section */}
      <div className="mt-10">
        <div className="flex justify-center mt-20">
          <h1 className="text-2xl">Map</h1>
        </div>
        <Separator className="mt-3" />
        <div className="mt-10">
          <GoogleMapWithDrawing onAreaSelected={handleMapDataChange} />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-10 flex justify-center">
        <button onClick={handleSubmit} className="btn btn-primary">
          Submit All Data
        </button>
      </div>
    </div>
  );
}
