import { useState, useMemo, useRef, useEffect } from "react";
import type { MunicipioFeature } from "../api";
import type { ViewMode } from "../App";

interface SearchBarProps {
  features: MunicipioFeature[];
  onSelect: (nombre: string) => void;
  viewMode: ViewMode;
}

export default function SearchBar({
  features,
  onSelect,
  viewMode,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return features
      .filter((f) => f.attributes.nombre?.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, features]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const placeholder =
    viewMode === "municipios" ? "Buscar municipio..." : "Buscar comarca...";

  return (
    <div className="search-bar" ref={ref}>
      <input
        className="search-input"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map((f) => (
            <div
              key={f.attributes.objectid}
              className="search-result-item"
              onClick={() => {
                onSelect(f.attributes.nombre);
                setQuery(f.attributes.nombre);
                setIsOpen(false);
              }}
            >
              {f.attributes.nombre}
              {f.attributes.comarca && (
                <span
                  style={{ color: "#999", fontSize: "0.75rem", marginLeft: 8 }}
                >
                  {f.attributes.comarca}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
