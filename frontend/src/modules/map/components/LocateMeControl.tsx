import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const LOCATE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="display:block"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/></svg>`;

export function LocateMeControl() {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "topleft" });

    control.onAdd = () => {
      const container = L.DomUtil.create("div", "leaflet-bar");

      const btn = L.DomUtil.create("a", "", container) as HTMLAnchorElement;
      btn.href = "#";
      btn.title = "Go to my location";
      btn.innerHTML = LOCATE_SVG;
      btn.style.cssText =
        "width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#555;";

      let loading = false;

      L.DomEvent.on(btn, "click", (e) => {
        L.DomEvent.preventDefault(e);
        if (loading || !navigator.geolocation) return;

        loading = true;
        btn.style.opacity = "0.5";

        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            loading = false;
            btn.style.opacity = "1";
            map.flyTo([coords.latitude, coords.longitude], 16, { duration: 1.2 });
          },
          () => {
            loading = false;
            btn.style.opacity = "1";
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      L.DomEvent.disableClickPropagation(container);
      return container;
    };

    control.addTo(map);
    return () => { control.remove(); };
  }, [map]);

  return null;
}
