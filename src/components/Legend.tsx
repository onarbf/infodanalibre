import { LEGEND_ITEMS } from "../api";

export default function Legend() {
  return (
    <div className="legend">
      <div className="legend-title">Inversión por municipio</div>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
