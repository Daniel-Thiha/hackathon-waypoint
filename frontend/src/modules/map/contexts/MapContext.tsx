import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { LatLng, MapBounds } from "../types/map.types";
import type { Map as LeafletMap } from "leaflet";

export type MapViewerRole = "Admin" | "RescueTeam" | "Volunteer" | "Survivor";
export type MapMode = "idle" | "picking-location";

interface MapContextValue {
  viewerRole: MapViewerRole;
  username: string | null;

  mapInstance: LeafletMap | null;
  setMapInstance: (map: LeafletMap | null) => void;

  panTo: (position: LatLng, zoom?: number) => void;
  fitBounds: (bounds: MapBounds) => void;

  mapMode: MapMode;
  handleMapClick: (coord: LatLng) => void;
  cancelMapAction: () => void;
  startPickingLocation: (onPicked: (latlng: LatLng) => void) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

interface MapProviderProps {
  children: ReactNode;
  viewerRole: MapViewerRole;
  username: string | null;
}

export function MapProvider({ children, viewerRole, username }: MapProviderProps) {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>("idle");
  const pickCallbackRef = useRef<((latlng: LatLng) => void) | null>(null);

  const panTo = useCallback((position: LatLng, zoom?: number) => {
    if (!mapInstance) return;
    if (zoom !== undefined) mapInstance.setView([position.lat, position.lng], zoom);
    else mapInstance.panTo([position.lat, position.lng]);
  }, [mapInstance]);

  const fitBounds = useCallback((bounds: MapBounds) => {
    if (!mapInstance) return;
    mapInstance.fitBounds([[bounds.south, bounds.west], [bounds.north, bounds.east]]);
  }, [mapInstance]);

  const handleMapClick = useCallback((coord: LatLng) => {
    if (pickCallbackRef.current) {
      pickCallbackRef.current(coord);
      pickCallbackRef.current = null;
      setMapMode("idle");
    }
  }, []);

  const cancelMapAction = useCallback(() => {
    setMapMode("idle");
    pickCallbackRef.current = null;
  }, []);

  const startPickingLocation = useCallback((onPicked: (latlng: LatLng) => void) => {
    pickCallbackRef.current = onPicked;
    setMapMode("picking-location");
  }, []);

  return (
    <MapContext.Provider
      value={{
        viewerRole, username,
        mapInstance, setMapInstance,
        panTo, fitBounds,
        mapMode, handleMapClick,
        cancelMapAction, startPickingLocation,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used within MapProvider");
  return ctx;
}
