import { formatCurrency } from "../api";
import type { ActuacionFeature } from "../api";

interface MapTooltipProps {
  actuacion: ActuacionFeature;
}

export default function MapTooltip({ actuacion }: MapTooltipProps) {
  const attrs = actuacion.attributes;

  return (
    <div className="map-tooltip">
      <div className="map-tooltip-label">ACTUACIÓN</div>
      <div className="map-tooltip-name">{attrs.nombre}</div>
      <div className="map-tooltip-amount">{formatCurrency(attrs.importe)}</div>
    </div>
  );
}
