import { GoogleMap, LoadScript, DrawingManager } from "@react-google-maps/api";
import { useState, useCallback } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = { lat: 13.7563, lng: 100.5018 }; // Example: Bangkok, Thailand

interface GoogleMapWithDrawingProps {
  onAreaSelected: (data: { lat: number; lng: number }[]) => void;
}

const GoogleMapWithDrawing = ({
  onAreaSelected,
}: GoogleMapWithDrawingProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onDrawingComplete = useCallback(
    (overlay: google.maps.drawing.OverlayCompleteEvent) => {
      const shape = overlay.overlay;

      if (shape instanceof google.maps.Polyline) {
        const path = shape.getPath();
        const coordinates = path.getArray().map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        console.log("Polyline coordinates:", coordinates);
        onAreaSelected(coordinates);
      } else {
        console.log("Unknown shape detected:", shape);
      }
    },
    [onAreaSelected]
  );

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={["drawing"]}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={(map) => setMap(map)}
      >
        {map && (
          <DrawingManager
            onOverlayComplete={onDrawingComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                  google.maps.drawing.OverlayType.POLYLINE,
                ],
              },
              polygonOptions: {
                fillColor: "#FF0000",
                fillOpacity: 0.5,
                strokeWeight: 2,
              },
              rectangleOptions: {
                fillColor: "#00FF00",
                fillOpacity: 0.5,
                strokeWeight: 2,
              },
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapWithDrawing;
