interface InfoModalProps {
  onClose: () => void;
}

export default function InfoModal({ onClose }: InfoModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <img
            src="https://infodanarecuperacion.es/visor/cdn/29/widgets/common/images/escudo.png"
            alt="Gobierno de España"
            style={{ height: 48 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}
            >
              Gobierno
              <br />
              de España
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <span style={{ fontSize: "1.4rem" }}>🇪🇸</span>
            <span style={{ fontSize: "1.4rem" }}>🏴</span>
          </div>
        </div>

        <div className="modal-title">infoDANA Recuperación</div>

        <p className="modal-text">
          La información contenida en este visor se actualiza de forma periódica
          y recoge los datos municipalizados relativos a las actuaciones
          financiadas por el Gobierno de España en los municipios afectados por
          la DANA de octubre y noviembre de 2024.
        </p>

        <p className="modal-text">
          Este instrumento permite consultar de manera transparente el mapa de
          las actuaciones. Las partidas corresponden a fondos económicos
          transferidos a particulares, autónomos, empresas o administraciones
          públicas, así como a aquellas ya ejecutadas o en ejecución por parte
          del Gobierno de España.
        </p>

        <div className="modal-plant">🌱</div>

        <p className="modal-text">
          Para obtener la información sobre el volumen total de ayudas, consulte{" "}
          <a
            href="https://www.lamoncloa.gob.es/info-dana"
            target="_blank"
            rel="noopener noreferrer"
          >
            InfoDANA
          </a>
          .
        </p>

        <div className="modal-footer">
          <span className="modal-date">
            Fecha de actualización: 25 de febrero de 2026
          </span>
          <button className="modal-close-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
