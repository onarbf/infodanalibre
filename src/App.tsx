import { useState, useMemo } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";
import InfoModal from "./components/InfoModal";
import Legend from "./components/Legend";
import MapTooltip from "./components/MapTooltip";
import ActuacionDetail from "./components/ActuacionDetail";
import ImageComparator from "./components/ImageComparator";
import { useDANAData } from "./hooks/useDANAData";
import type { MunicipioFeature, ActuacionFeature } from "./api";

export type ViewMode = "municipios" | "comarcas";
export type Page = "data" | "comparator";

export default function App() {
  const [page, setPage] = useState<Page>("data");
  const [viewMode, setViewMode] = useState<ViewMode>("municipios");
  const [showModal, setShowModal] = useState(true);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedActuacion, setSelectedActuacion] =
    useState<ActuacionFeature | null>(null);

  const { municipios, comarcas, actuaciones, totals, loading } = useDANAData();

  const currentData = viewMode === "municipios" ? municipios : comarcas;

  // Find the selected feature for detail view
  const selectedFeature: MunicipioFeature | null = useMemo(() => {
    if (!selectedMunicipio) return null;
    return (
      currentData.find((f) => f.attributes.nombre === selectedMunicipio) ?? null
    );
  }, [selectedMunicipio, currentData]);

  const handleBack = () => {
    setSelectedMunicipio(null);
    setSelectedActuacion(null);
  };

  const handleActuacionClick = (act: ActuacionFeature) => {
    setSelectedActuacion(act);
    setSelectedMunicipio(null);
  };

  const handleMunicipioClick = (name: string | null) => {
    setSelectedMunicipio(name);
    setSelectedActuacion(null);
  };

  // Show detail panel if actuacion is selected
  const showActuacionDetail = selectedActuacion !== null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Header page={page} onPageChange={setPage} />

      {page === "comparator" ? (
        <div className="main-layout">
          <ImageComparator />
        </div>
      ) : (
        <div className="main-layout">
          {showActuacionDetail ? (
            <ActuacionDetail
              actuacion={selectedActuacion}
              onBack={handleBack}
            />
          ) : (
            <Sidebar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totals={totals}
              activeCategory={activeCategory}
              onCategoryClick={setActiveCategory}
              selectedFeature={selectedFeature}
              onBack={handleBack}
            />
          )}

          <div className="map-container">
            {loading ? (
              <div className="loading">
                <div className="spinner" />
                Cargando datos...
              </div>
            ) : (
              <MapView
                features={currentData}
                actuaciones={actuaciones}
                viewMode={viewMode}
                selectedMunicipio={selectedMunicipio}
                activeCategory={activeCategory}
                onMunicipioClick={handleMunicipioClick}
                onActuacionClick={handleActuacionClick}
                selectedActuacion={selectedActuacion}
              />
            )}

            {selectedActuacion && <MapTooltip actuacion={selectedActuacion} />}

            <SearchBar
              features={currentData}
              onSelect={handleMunicipioClick}
              viewMode={viewMode}
            />

            <Legend />
          </div>
        </div>
      )}

      {showModal && <InfoModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
