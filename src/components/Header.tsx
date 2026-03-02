import type { Page } from "../App";

interface HeaderProps {
  page: Page;
  onPageChange: (page: Page) => void;
}

export default function Header({ page, onPageChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <img
          src="https://infodanarecuperacion.es/visor/cdn/29/widgets/common/images/escudo.png"
          alt="Gobierno de España"
          className="header-logo"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="header-title">infoDANA Recuperación</span>
      </div>
      <div className="header-right">
        <button
          className={`page-toggle-btn ${page === "comparator" ? "active" : ""}`}
          onClick={() => onPageChange(page === "data" ? "comparator" : "data")}
        >
          🛰️ Comparador de imágenes
        </button>
        <button className="lang-btn" title="Español">
          🇪🇸
        </button>
        <button className="lang-btn" title="Valencià">
          🏴
        </button>
      </div>
    </header>
  );
}
