import "leaflet/dist/leaflet.css";
import { useEffect, type ReactNode } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useMapContext } from "../contexts/MapContext";
import { LocateMeControl } from "./LocateMeControl";
import { MapLegend } from "./MapLegend";

Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018];
const DEFAULT_ZOOM = 11;

function MapInstanceBridge() {
  const map = useMap();
  const { setMapInstance } = useMapContext();
  useEffect(() => {
    setMapInstance(map);
    return () => setMapInstance(null);
  }, [map, setMapInstance]);
  return null;
}

function MapClickHandler() {
  const { mapMode, handleMapClick } = useMapContext();
  useMapEvents({
    click: (e) => {
      if (mapMode === "picking-location") {
        handleMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

// Fixes Leaflet blank tiles on mobile: when the container goes from hidden to
// visible the map doesn't know its new size until we tell it.
function SizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

interface BaseMapProps {
  children?: ReactNode;
}

export function BaseMap({ children }: BaseMapProps) {
  const { mapMode } = useMapContext();

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{
        width: "100%",
        height: "100%",
        cursor: mapMode === "picking-location" ? "crosshair" : "",
      }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapInstanceBridge />
      <MapClickHandler />
      <SizeWatcher />
      <LocateMeControl />
      <MapLegend />
      {children}
    </MapContainer>
  );
}
