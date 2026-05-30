export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Shared entity shapes — feature modules build on these
export interface MapMarker {
  id: string;
  position: LatLng;
  title?: string;
}

export interface MapPolygon {
  id: string;
  paths: LatLng[];
  fillColor?: string;
  strokeColor?: string;
  fillOpacity?: number;
}

export interface MapPolyline {
  id: string;
  path: LatLng[];
  strokeColor?: string;
  strokeWeight?: number;
}
