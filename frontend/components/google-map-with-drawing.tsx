"use client";

import { GoogleMap, LoadScript, DrawingManager } from "@react-google-maps/api";
import { useState, useCallback } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = { lat: 13.7563, lng: 100.5018 }; // Example: Bangkok, Thailand

const GoogleMapWithDrawing = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // handles drawing complete
  const onDrawingComplete = useCallback(
    (overlay: google.maps.drawing.OverlayCompleteEvent) => {
      console.log("Drawing complete:", overlay);

      const shape = overlay.overlay;

      // check the shape of the drawing
      if (shape instanceof google.maps.Polygon) {
        console.log("Polygon detected:", shape);
        const path = shape.getPath();
        const coordinates = path.getArray().map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        console.log("Polygon coordinates:", coordinates);
      } else if (shape instanceof google.maps.Rectangle) {
        console.log("Rectangle detected:", shape);
        const bounds = shape.getBounds();
        if (bounds) {
          const northEast = bounds.getNorthEast();
          const southWest = bounds.getSouthWest();
          console.log("Rectangle coordinates:", {
            northEast: { lat: northEast.lat(), lng: northEast.lng() },
            southWest: { lat: southWest.lat(), lng: southWest.lng() },
          });
        } else {
          console.log("Bounds are null, rectangle not fully drawn yet.");
        }
      } else if (shape instanceof google.maps.Circle) {
        console.log("Circle detected:", shape);
        const center = shape.getCenter();
        const radius = shape.getRadius();
        if (center) {
          console.log("Circle center:", {
            lat: center.lat(),
            lng: center.lng(),
            radius: radius, // circle's radius in meters
          });
        } else {
          console.log("Circle center is null.");
        }
      } else if (shape instanceof google.maps.Polyline) {
        console.log("Polyline detected:", shape);
        const path = shape.getPath();
        const coordinates = path.getArray().map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        console.log("Polyline coordinates:", coordinates);
      }
      // in case of unrecognized shape types
      else {
        console.log("Unknown shape detected:", shape);
      }
    },
    []
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
                  google.maps.drawing.OverlayType.POLYGON,
                  google.maps.drawing.OverlayType.RECTANGLE,
                  google.maps.drawing.OverlayType.CIRCLE,
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
