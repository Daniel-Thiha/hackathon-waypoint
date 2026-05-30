import { useEffect, type ReactNode } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMapContext } from "../contexts/MapContext";

function MapEventHandler() {
  const { setMapInstance, handleMapClick } = useMapContext();
  const map = useMap();

  useEffect(() => {
    setMapInstance(map);
    return () => setMapInstance(null);
  }, [map, setMapInstance]);

  useMapEvents({
    click(e) {
      handleMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

export function BaseMap({ children }: { children?: ReactNode }) {
  const { mapMode } = useMapContext();

  return (
    <div
      className={`relative h-full w-full ${mapMode === "picking-location" ? "cursor-crosshair" : ""}`}
    >
      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={11}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler />
        {children}
      </MapContainer>
    </div>
  );
}
