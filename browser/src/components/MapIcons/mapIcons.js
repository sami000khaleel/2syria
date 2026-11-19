import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Safety net: point Leaflet's default icon at the bundled images
// (Vite renames them, so Leaflet can't find them on its own -> only the alt text shows)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Place pin drawn as SVG: nothing to download, always sharp
const pinSvg = (fill) => `
  <svg viewBox="0 0 34 44" width="100%" height="100%" aria-hidden="true">
    <path d="M17 1.5C8.4 1.5 1.5 8.3 1.5 16.7 1.5 28.3 17 42.5 17 42.5S32.5 28.3 32.5 16.7C32.5 8.3 25.6 1.5 17 1.5z"
      fill="${fill}" stroke="#ffffff" stroke-width="2.5"/>
    <circle cx="17" cy="16.5" r="6" fill="#ffffff"/>
  </svg>`;

const placeIconNormal = L.divIcon({
  className: "map-pin",
  html: pinSvg("#2496E6"),
  iconSize: [30, 39],
  iconAnchor: [15, 38],
  popupAnchor: [0, -34],
});

const placeIconActive = L.divIcon({
  className: "map-pin map-pin--active",
  html: pinSvg("#CE1126"),
  iconSize: [40, 52],
  iconAnchor: [20, 50],
  popupAnchor: [0, -44],
});

export const placeIcon = (active = false) => (active ? placeIconActive : placeIconNormal);

// "You are here": pulsing blue dot
export const userIcon = L.divIcon({
  className: "user-dot",
  html: '<span class="user-dot__pulse"></span><span class="user-dot__core"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});
