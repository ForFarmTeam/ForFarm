// use-drawing-manager.tsx
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

// Define types for the data we'll pass back
type MarkerData = { type: "marker"; position: { lat: number; lng: number } };
type PolygonData = { type: "polygon"; path: { lat: number; lng: number }[] };
type PolylineData = { type: "polyline"; path: { lat: number; lng: number }[] };
// Add other types (Rectangle, Circle) if you enable them
// type RectangleData = { type: 'rectangle'; bounds: { north: number; east: number; south: number; west: number } };
// type CircleData = { type: 'circle'; center: { lat: number; lng: number }; radius: number };

export type ShapeData = MarkerData | PolygonData | PolylineData; // | RectangleData | CircleData;

// Add the callback function type to the hook's arguments
export function useDrawingManager(
  onOverlayComplete?: (data: ShapeData) => void,
  initialValue: google.maps.drawing.DrawingManager | null = null
) {
  const map = useMap();
  const drawing = useMapsLibrary("drawing");

  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(initialValue);

  useEffect(() => {
    if (!map || !drawing) return;

    const newDrawingManager = new drawing.DrawingManager({
      map,
      // drawingMode: google.maps.drawing.OverlayType.MARKER, // You might want to set initial mode to null or let user choose
      drawingMode: null, // Start without an active drawing mode
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.MARKER,
          // google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.POLYLINE,
          // google.maps.drawing.OverlayType.RECTANGLE,
        ],
      },
      markerOptions: {
        draggable: true,
      },
      // circleOptions: { // Uncomment if using circles
      //   editable: false,
      // },
      polygonOptions: {
        editable: true,
        draggable: true,
      },
      // rectangleOptions: { // Uncomment if using rectangles
      //   editable: true,
      //   draggable: true,
      // },
      polylineOptions: {
        editable: true,
        draggable: true,
      },
    });

    setDrawingManager(newDrawingManager);

    // --- Add Event Listener ---
    const overlayCompleteListener = google.maps.event.addListener(
      newDrawingManager,
      "overlaycomplete",
      (event: google.maps.drawing.OverlayCompleteEvent) => {
        let data: ShapeData | null = null;
        const overlay = event.overlay;

        // Extract coordinates based on type
        switch (event.type) {
          case google.maps.drawing.OverlayType.MARKER:
            const marker = overlay as google.maps.Marker;
            const position = marker.getPosition();
            if (position) {
              data = {
                type: "marker",
                position: { lat: position.lat(), lng: position.lng() },
              };
            }
            // Optional: remove the drawn marker immediately if you only want the data
            // marker.setMap(null);
            break;

          case google.maps.drawing.OverlayType.POLYGON:
            const polygon = overlay as google.maps.Polygon;
            const path = polygon.getPath().getArray();
            data = {
              type: "polygon",
              path: path.map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() })),
            };
            // Optional: remove the drawn polygon
            // polygon.setMap(null);
            break;

          case google.maps.drawing.OverlayType.POLYLINE:
            const polyline = overlay as google.maps.Polyline;
            const linePath = polyline.getPath().getArray();
            data = {
              type: "polyline",
              path: linePath.map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() })),
            };
            // Optional: remove the drawn polyline
            // polyline.setMap(null);
            break;

          // Add cases for RECTANGLE and CIRCLE if you enable them

          default:
            console.warn("Unhandled overlay type:", event.type);
            break;
        }

        // Call the callback function if provided and data was extracted
        if (data && onOverlayComplete) {
          onOverlayComplete(data);
        }

        // Optional: Set drawing mode back to null after completion
        // newDrawingManager.setDrawingMode(null);
      }
    );
    // --- End Event Listener ---

    // Cleanup function
    return () => {
      // Remove the event listener
      google.maps.event.removeListener(overlayCompleteListener);
      // Remove the drawing manager from the map
      newDrawingManager.setMap(null);
    };
    // Add onOverlayComplete to dependency array to ensure the latest callback is used
  }, [map, drawing, onOverlayComplete]);

  return drawingManager;
}
