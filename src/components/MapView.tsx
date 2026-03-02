import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { ViewMode } from "../App";
import {
  formatCurrency,
  formatCurrencyShort,
  getInversionColor,
  CATEGORIES,
} from "../api";
import type { MunicipioFeature, ActuacionFeature } from "../api";

interface MapViewProps {
  features: MunicipioFeature[];
  actuaciones: ActuacionFeature[];
  viewMode: ViewMode;
  selectedMunicipio: string | null;
  activeCategory: string | null;
  onMunicipioClick: (name: string | null) => void;
  onActuacionClick: (actuacion: ActuacionFeature) => void;
  selectedActuacion: ActuacionFeature | null;
}

// Default map center (Valencia area)
const DEFAULT_CENTER: [number, number] = [39.3, -0.7];
const DEFAULT_ZOOM = 9;

function FlyToSelected({
  selectedMunicipio,
  features,
}: {
  selectedMunicipio: string | null;
  features: MunicipioFeature[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedMunicipio) return;

    const feature = features.find(
      (f) => f.attributes.nombre === selectedMunicipio,
    );

    if (feature?.centroid) {
      map.flyTo([feature.centroid.y, feature.centroid.x], 12, { duration: 1 });
    }
  }, [selectedMunicipio, features, map]);

  return null;
}

function FlyToActuacion({ actuacion }: { actuacion: ActuacionFeature | null }) {
  const map = useMap();

  useEffect(() => {
    if (!actuacion) return;
    map.flyTo([actuacion.geometry.y, actuacion.geometry.x], 13, {
      duration: 1,
    });
  }, [actuacion, map]);

  return null;
}

/** Creates a custom pane for actuaciones circles above the overlay pane */
function CreateCirclesPane() {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane("circlesPane")) {
      const pane = map.createPane("circlesPane");
      pane.style.zIndex = "650"; // above overlayPane (400) and markerPane (600)
      pane.style.pointerEvents = "auto";
    }
  }, [map]);

  return null;
}

export default function MapView({
  features,
  actuaciones,
  viewMode,
  selectedMunicipio,
  activeCategory,
  onMunicipioClick,
  onActuacionClick,
  selectedActuacion,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Convert ArcGIS features to GeoJSON for polygon rendering
  const geoJsonData = useMemo(() => {
    const geoFeatures = features
      .filter((f) => f.geometry?.rings)
      .map((f) => ({
        type: "Feature" as const,
        properties: f.attributes,
        geometry: {
          type: "Polygon" as const,
          coordinates: f.geometry!.rings,
        },
      }));

    return {
      type: "FeatureCollection" as const,
      features: geoFeatures,
    };
  }, [features]);

  // Get the active category field for coloring
  const activeField = useMemo(() => {
    if (!activeCategory) return "inversion";
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    return cat?.field || "inversion";
  }, [activeCategory]);

  // Style function for GeoJSON polygons
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStyle = (feature: any) => {
    const isSelected =
      selectedMunicipio && feature.properties.nombre === selectedMunicipio;
    const value = feature.properties[activeField] || 0;
    return {
      fillColor: getInversionColor(value),
      weight: isSelected ? 3 : 1,
      opacity: isSelected ? 1 : 0.7,
      color: isSelected ? "#f5c518" : "#666",
      fillOpacity: isSelected ? 0.7 : 0.4,
    };
  };

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
      ref={mapRef}
    >
      <CreateCirclesPane />

      <TileLayer
        attribution="&copy; Google Maps"
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        maxZoom={20}
      />

      {/* Choropleth polygons */}
      <GeoJSON
        key={`${viewMode}-${activeField}-${selectedMunicipio}`}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={geoJsonData as any}
        style={getStyle}
        onEachFeature={(feature, layer) => {
          layer.on({
            mouseover: (e) => {
              const l = e.target;
              if (feature.properties.nombre !== selectedMunicipio) {
                l.setStyle({
                  weight: 2,
                  color: "#f5c518",
                  fillOpacity: 0.6,
                });
              }
            },
            mouseout: (e) => {
              if (feature.properties.nombre !== selectedMunicipio) {
                e.target.setStyle(getStyle(feature));
              }
            },
            click: () => {
              onMunicipioClick(feature.properties.nombre);
            },
          });
        }}
      />

      {/* Actuaciones circle markers */}
      {actuaciones.map((act) => {
        const isSelected =
          selectedActuacion?.attributes.objectid === act.attributes.objectid;
        return (
          <CircleMarker
            key={act.attributes.objectid}
            center={[act.geometry.y, act.geometry.x]}
            radius={isSelected ? 12 : 8}
            pane="circlesPane"
            pathOptions={{
              fillColor: isSelected ? "#f5c518" : "#e8590c",
              fillOpacity: 0.9,
              color: "#fff",
              weight: isSelected ? 3 : 2,
            }}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                onActuacionClick(act);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                {act.attributes.nombre}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                {formatCurrencyShort(act.attributes.importe)}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}

      <FlyToSelected
        selectedMunicipio={selectedMunicipio}
        features={features}
      />
      <FlyToActuacion actuacion={selectedActuacion} />
    </MapContainer>
  );
}
