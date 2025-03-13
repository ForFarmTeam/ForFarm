"use client";
import { SetStateAction, useEffect, useState } from "react";
import PlantingDetailsForm from "./planting-detail-form";
import HarvestDetailsForm from "./harvest-detail-form";
import { Separator } from "@/components/ui/separator";
import GoogleMapWithDrawing from "@/components/google-map-with-drawing";

export default function SetupPage() {
  type PlantingDetails = {
    daysToEmerge: number;
    plantSpacing: number;
    rowSpacing: number;
    plantingDepth: number;
    averageHeight: number;
    isPerennial: boolean;
    autoCreateTasks: boolean;
    startMethod?: string;
    lightProfile?: string;
    soilConditions?: string;
    plantingDetails?: string;
    pruningDetails?: string;
  };

  const [plantingDetails, setPlantingDetails] =
    useState<PlantingDetails | null>(null);
  const [harvestDetails, setHarvestDetails] = useState(null);
  const [mapData, setMapData] = useState(null);

  // handle planting details submission
  const handlePlantingDetailsChange = (data: {
    daysToEmerge: number;
    plantSpacing: number;
    rowSpacing: number;
    plantingDepth: number;
    averageHeight: number;
    isPerennial: boolean;
    autoCreateTasks: boolean;
    startMethod?: string;
    lightProfile?: string;
    soilConditions?: string;
    plantingDetails?: string;
    pruningDetails?: string;
  }) => {
    setPlantingDetails(data);
  };

  // handle harvest details submission
  const handleHarvestDetailsChange = (data: SetStateAction<null>) => {
    setHarvestDetails(data);
  };

  // handle map area selection
  const handleMapDataChange = (data: SetStateAction<null>) => {
    setMapData(data);
  };

  useEffect(() => {
    console.log(plantingDetails);
  }, [plantingDetails]);

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
        {/* <HarvestDetailsForm onChange={handleHarvestDetailsChange} /> */}
      </div>

      {/* Map Section */}
      <div className="mt-10">
        <div className="flex justify-center mt-20">
          <h1 className="text-2xl">Map</h1>
        </div>
        <Separator className="mt-3" />
        <div className="mt-10">
          {/* <GoogleMapWithDrawing onAreaSelected={handleMapDataChange} /> */}
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
