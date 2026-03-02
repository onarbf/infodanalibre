import { CATEGORIES, formatCurrency } from "../api";
import type { ViewMode } from "../App";
import type { Totals } from "../hooks/useDANAData";
import type { MunicipioFeature } from "../api";

interface SidebarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totals: Totals;
  activeCategory: string | null;
  onCategoryClick: (cat: string | null) => void;
  selectedFeature: MunicipioFeature | null;
  onBack: () => void;
}

export default function Sidebar({
  viewMode,
  onViewModeChange,
  totals,
  activeCategory,
  onCategoryClick,
  selectedFeature,
  onBack,
}: SidebarProps) {
  // If a municipio is selected, show its detail
  if (selectedFeature) {
    const attrs = selectedFeature.attributes;
    return (
      <aside className="sidebar">
        <button className="back-btn" onClick={onBack}>
          ←
        </button>

        <div className="total-card">
          <div className="total-label">Municipio</div>
          <div className="total-amount-card">
            <div className="total-amount" style={{ fontSize: "1rem" }}>
              {attrs.nombre}
            </div>
          </div>
        </div>

        <div
          className="total-card"
          style={{
            background: "var(--dana-yellow-light)",
            padding: "10px 16px",
          }}
        >
          <div className="total-amount">{formatCurrency(attrs.inversion)}</div>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((cat) => {
            const value = (attrs[cat.field] as number) || 0;
            return (
              <div key={cat.id} className="category-card">
                <div className="category-icon">{cat.icon}</div>
                <div className="category-name">{cat.name}</div>
                <div className="category-amount">{formatCurrency(value)}</div>
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      {/* View mode toggle */}
      <div className="toggle-group">
        <button
          className={`toggle-btn ${viewMode === "municipios" ? "active" : ""}`}
          onClick={() => onViewModeChange("municipios")}
        >
          Municipios
        </button>
        <button
          className={`toggle-btn ${viewMode === "comarcas" ? "active" : ""}`}
          onClick={() => onViewModeChange("comarcas")}
        >
          Comarcas
        </button>
      </div>

      {/* Total investment */}
      <div className="total-card">
        <div className="total-label">Inversión Total</div>
        <div className="total-amount-card">
          <div className="total-amount">{formatCurrency(totals.inversion)}</div>
        </div>
      </div>

      {/* Category cards */}
      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className={`category-card ${activeCategory === cat.id ? "active" : ""}`}
            onClick={() =>
              onCategoryClick(activeCategory === cat.id ? null : cat.id)
            }
          >
            <button className="category-menu-btn" title="Más opciones">
              ⋮
            </button>
            <div className="category-icon">{cat.icon}</div>
            <div className="category-name">{cat.name}</div>
            <div className="category-amount">
              {formatCurrency(totals.byCategory[cat.field] || 0)}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
