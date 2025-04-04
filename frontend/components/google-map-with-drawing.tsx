import React, { useEffect, useRef, useState } from "react";
import { Map, useMap, useMapsLibrary, MapControl, ControlPosition } from "@vis.gl/react-google-maps";
import { UndoRedoControl } from "@/components/map-component/undo-redo-control";
import { useDrawingManager } from "@/components/map-component/use-drawing-manager";
import { GeoFeatureData, GeoPosition } from "@/types";

export type ShapeData = GeoFeatureData;

interface GoogleMapWithDrawingProps {
  onShapeDrawn?: (data: GeoFeatureData) => void;
  initialCenter?: GeoPosition;
  initialZoom?: number;
  initialFeatures?: GeoFeatureData[] | null;
  drawingMode?: google.maps.drawing.OverlayType | null;
  editable?: boolean;
  displayOnly?: boolean;
  mapId?: string;
}

const GoogleMapWithDrawingInternal = ({
  onShapeDrawn,
  initialCenter = { lat: 13.7563, lng: 100.5018 },
  initialZoom = 10,
  initialFeatures,
  drawingMode = null,
  editable = true,
  displayOnly = false,
}: GoogleMapWithDrawingProps) => {
  const map = useMap();
  const geometryLib = useMapsLibrary("geometry");
  const [drawnOverlays, setDrawnOverlays] = useState<
    (google.maps.Marker | google.maps.Polygon | google.maps.Polyline)[]
  >([]);
  const isMountedRef = useRef(false);

  const drawingManager = useDrawingManager(onShapeDrawn);

  useEffect(() => {
    if (!map || !initialFeatures || initialFeatures.length === 0 || !geometryLib) return;
    if (isMountedRef.current && !displayOnly) return;

    drawnOverlays.forEach((overlay) => overlay.setMap(null));
    const newOverlays: (google.maps.Marker | google.maps.Polygon | google.maps.Polyline)[] = [];
    const bounds = new google.maps.LatLngBounds();

    initialFeatures.forEach((feature) => {
      if (!feature) return;

      let overlay: google.maps.Marker | google.maps.Polygon | google.maps.Polyline | null = null;

      try {
        if (feature.type === "marker" && feature.position) {
          const marker = new google.maps.Marker({
            position: feature.position,
            map: map,
          });
          bounds.extend(feature.position);
          overlay = marker;
        } else if (feature.type === "polygon" && feature.path && feature.path.length > 0) {
          const polygon = new google.maps.Polygon({
            paths: feature.path,
            map: map,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
          });
          feature.path.forEach((pos) => bounds.extend(pos));
          overlay = polygon;
        } else if (feature.type === "polyline" && feature.path && feature.path.length > 0) {
          const polyline = new google.maps.Polyline({
            path: feature.path,
            map: map,
            strokeColor: "#0000FF",
            strokeOpacity: 1.0,
            strokeWeight: 3,
          });
          feature.path.forEach((pos) => bounds.extend(pos));
          overlay = polyline;
        }

        if (overlay) {
          newOverlays.push(overlay);
        }
      } catch (e) {
        console.error("Error creating map overlay:", e, "Feature:", feature);
      }
    });

    setDrawnOverlays(newOverlays);

    if (newOverlays.length === 1 && initialFeatures[0]?.type === "marker") {
      map.setCenter(initialFeatures[0].position);
      map.setZoom(initialZoom + 4);
    } else if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    } else {
      map.setCenter(initialCenter);
      map.setZoom(initialZoom);
    }
    isMountedRef.current = true;

    return () => {
      newOverlays.forEach((overlay) => {
        try {
          overlay.setMap(null);
        } catch (e) {
          console.warn("Error removing overlay during cleanup:", e);
        }
      });
      setDrawnOverlays([]);
      isMountedRef.current = false;
    };
  }, [map, initialFeatures, geometryLib, displayOnly]);

  useEffect(() => {
    if (drawingManager) {
      drawingManager.setOptions({
        drawingControl: !displayOnly,
        drawingMode: displayOnly ? null : drawingMode,
        markerOptions: {
          draggable: !displayOnly && editable,
        },
        polygonOptions: {
          editable: !displayOnly && editable,
          draggable: !displayOnly && editable,
        },
        polylineOptions: {
          editable: !displayOnly && editable,
          draggable: !displayOnly && editable,
        },
      });
    }
  }, [drawingManager, displayOnly, drawingMode, editable]);

  return (
    <>
      <Map
        defaultZoom={initialZoom}
        defaultCenter={initialCenter}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId={"YOUR_MAP_ID"}
      />

      {!displayOnly && drawingManager && (
        <MapControl position={ControlPosition.TOP_LEFT}>
          {editable && <UndoRedoControl drawingManager={drawingManager} />}
        </MapControl>
      )}
    </>
  );
};

const GoogleMapWithDrawing = (props: GoogleMapWithDrawingProps) => {
  return <GoogleMapWithDrawingInternal {...props} />;
};

export default GoogleMapWithDrawing;
