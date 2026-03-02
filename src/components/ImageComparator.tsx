import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, WMSTileLayer, useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";

/* ─── Layer URLs ─── */
const PRE_DANA_WMS_URL = "https://www.ign.es/wms-inspire/pnoa-ma";
const PRE_DANA_WMS_LAYERS = "OI.OrthoimageCoverage";

const POST_DANA_TILE_URL =
  "https://tiles.arcgis.com/tiles/dha0QtUTrPxlyZDZ/arcgis/rest/services/ortofotoBas_Valencia/MapServer/tile/{z}/{y}/{x}";

/* ─── Valencia center & bounds ─── */
const CENTER: [number, number] = [39.42, -0.44];
const DEFAULT_ZOOM = 13;

/* ─── Bookmarks ("Áreas de información") ─── */
const BOOKMARKS = [
  { label: "Paiporta", center: [39.427, -0.418] as [number, number], zoom: 15 },
  {
    label: "Catarroja",
    center: [39.402, -0.407] as [number, number],
    zoom: 15,
  },
  { label: "Sedaví", center: [39.42, -0.39] as [number, number], zoom: 16 },
  { label: "Torrent", center: [39.437, -0.465] as [number, number], zoom: 14 },
  { label: "Chiva", center: [39.475, -0.72] as [number, number], zoom: 14 },
  { label: "Utiel", center: [39.57, -1.21] as [number, number], zoom: 13 },
];

/* ─── Clip the post-DANA layer to the right side of the swipe ─── */
function ClipLayer({ sliderX }: { sliderX: number }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    // Find the second tile pane (post-DANA tiles)
    const panes = container.querySelectorAll<HTMLElement>(
      ".leaflet-tile-pane .leaflet-layer",
    );
    // WMS = first layer, ArcGIS tiles = second layer
    if (panes.length >= 2) {
      const postPane = panes[1];
      postPane.style.clipPath = `inset(0 0 0 ${sliderX}px)`;
    }
  }, [sliderX, map]);

  // Also re-clip after map move/zoom
  useEffect(() => {
    const handler = () => {
      const container = map.getContainer();
      const panes = container.querySelectorAll<HTMLElement>(
        ".leaflet-tile-pane .leaflet-layer",
      );
      if (panes.length >= 2) {
        panes[1].style.clipPath = `inset(0 0 0 ${sliderX}px)`;
      }
    };
    map.on("move zoom", handler);
    return () => {
      map.off("move zoom", handler);
    };
  }, [sliderX, map]);

  return null;
}

/* ─── Main component ─── */
export default function ImageComparator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [sliderX, setSliderX] = useState<number>(0);
  const [dragging, setDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Initialize slider position to center
  useEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      setContainerWidth(w);
      setSliderX(w / 2);
    }
  }, []);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setContainerWidth(w);
        setSliderX((prev) => Math.min(prev, w));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pointer move handler
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderX(x);
    },
    [dragging],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  const handleSliderDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const flyTo = (center: [number, number], zoom: number) => {
    mapRef.current?.flyTo(center, zoom, { duration: 1 });
  };

  return (
    <div className="comparator-wrapper">
      {/* Sidebar with bookmarks */}
      <div className="comparator-sidebar">
        <div className="comparator-sidebar-title">Comparador de imágenes</div>
        <p className="comparator-sidebar-desc">
          Arrastra el control deslizante para comparar las imágenes de satélite
          antes y después de la DANA.
        </p>

        <div className="comparator-labels-box">
          <div className="comparator-label-row">
            <span className="comparator-label-dot pre" />
            <span>Ortofoto pre-DANA (PNOA)</span>
          </div>
          <div className="comparator-label-row">
            <span className="comparator-label-dot post" />
            <span>Ortofoto post-DANA (10/11/24)</span>
          </div>
        </div>

        <div className="comparator-bookmarks">
          <div className="comparator-bookmarks-title">Áreas de información</div>
          {BOOKMARKS.map((b) => (
            <button
              key={b.label}
              className="comparator-bookmark-btn"
              onClick={() => flyTo(b.center, b.zoom)}
            >
              📍 {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map area */}
      <div className="comparator-map-area" ref={containerRef}>
        {containerWidth > 0 && (
          <MapContainer
            center={CENTER}
            zoom={DEFAULT_ZOOM}
            zoomControl={true}
            style={{ width: "100%", height: "100%" }}
            ref={mapRef}
          >
            {/* Left side: Pre-DANA orthophoto (WMS) */}
            <WMSTileLayer
              url={PRE_DANA_WMS_URL}
              layers={PRE_DANA_WMS_LAYERS}
              format="image/jpeg"
              transparent={false}
              maxZoom={20}
              attribution='© <a href="https://www.ign.es">IGN</a> PNOA'
            />

            {/* Right side: Post-DANA orthophoto (ArcGIS tiles) */}
            <TileLayer
              url={POST_DANA_TILE_URL}
              maxZoom={20}
              attribution='© <a href="https://www.scne.es">SCNE</a> CC BY 4.0'
            />

            <ClipLayer sliderX={sliderX} />
          </MapContainer>
        )}

        {/* Swipe slider */}
        <div className="swipe-slider" style={{ left: `${sliderX}px` }}>
          <div className="swipe-line" />
          <div className="swipe-handle" onPointerDown={handleSliderDown}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 5l-5 7 5 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 5l5 7-5 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Side labels on the map */}
        <div className="swipe-label swipe-label-left">Pre-DANA</div>
        <div className="swipe-label swipe-label-right">Post-DANA</div>
      </div>
    </div>
  );
}
