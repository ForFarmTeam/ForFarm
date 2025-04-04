// google-map-with-drawing.tsx
import React from "react";
import { ControlPosition, Map, MapControl } from "@vis.gl/react-google-maps";

import { UndoRedoControl } from "@/components/map-component/undo-redo-control";
// Import ShapeData and useDrawingManager from the correct path
import { useDrawingManager, type ShapeData } from "@/components/map-component/use-drawing-manager"; // Adjust path if needed

// Export the type so the form can use it
export { type ShapeData };

// Define props for the component
interface GoogleMapWithDrawingProps {
  onShapeDrawn: (data: ShapeData) => void; // Callback prop
  // Add any other props you might need, e.g., initialCenter, initialZoom
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

// Rename DrawingExample to GoogleMapWithDrawing and accept props
const GoogleMapWithDrawing = ({
  onShapeDrawn, // Destructure the callback prop
  initialCenter = { lat: 13.7563, lng: 100.5018 }, // Default center
  initialZoom = 10, // Default zoom
}: GoogleMapWithDrawingProps) => {
  // Pass the onShapeDrawn callback directly to the hook
  const drawingManager = useDrawingManager(onShapeDrawn);

  return (
    <>
      {/* Use props for map defaults */}
      <Map
        defaultZoom={initialZoom}
        defaultCenter={initialCenter}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId={"YOUR_MAP_ID"} // Recommended: Add a Map ID
      />

      {/* Render controls only if drawingManager is available */}
      {drawingManager && (
        <MapControl position={ControlPosition.TOP_LEFT}>
          {/* Pass drawingManager to UndoRedoControl */}
          <UndoRedoControl drawingManager={drawingManager} />
        </MapControl>
      )}
      {/* The drawing controls (marker, polygon etc.) are added by useDrawingManager */}
    </>
  );
};

export default GoogleMapWithDrawing;
