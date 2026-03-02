import { useEffect, useState } from "react";
import { formatCurrency, fetchAttachments, getAttachmentUrl } from "../api";
import type { ActuacionFeature, AttachmentInfo } from "../api";

interface ActuacionDetailProps {
  actuacion: ActuacionFeature;
  onBack: () => void;
}

export default function ActuacionDetail({
  actuacion,
  onBack,
}: ActuacionDetailProps) {
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const attrs = actuacion.attributes;

  useEffect(() => {
    setCurrentImageIdx(0);
    if (attrs.count_attach > 0) {
      setLoadingImages(true);
      fetchAttachments(attrs.objectid)
        .then(setAttachments)
        .catch(() => setAttachments([]))
        .finally(() => setLoadingImages(false));
    } else {
      setAttachments([]);
    }
  }, [attrs.objectid, attrs.count_attach]);

  const imageAttachments = attachments.filter((a) =>
    a.contentType?.startsWith("image/"),
  );

  const handlePrev = () => {
    setCurrentImageIdx((i) => (i > 0 ? i - 1 : imageAttachments.length - 1));
  };

  const handleNext = () => {
    setCurrentImageIdx((i) => (i < imageAttachments.length - 1 ? i + 1 : 0));
  };

  return (
    <aside className="sidebar">
      <button className="back-btn" onClick={onBack}>
        ←
      </button>

      <div className="detail-header">
        <div className="detail-name-card">{attrs.nombre}</div>
        <div className="total-amount-card">
          <div className="total-amount">{formatCurrency(attrs.importe)}</div>
        </div>
      </div>

      {attrs.descripcion && (
        <div className="detail-description">{attrs.descripcion}</div>
      )}

      {attrs.ministerio && (
        <div className="detail-meta">
          <span className="detail-meta-label">Organismo:</span>
          <span className="detail-meta-value">{attrs.ministerio}</span>
        </div>
      )}

      {/* Image gallery */}
      {loadingImages && (
        <div className="detail-images-loading">
          <div className="spinner" /> Cargando imágenes...
        </div>
      )}

      {imageAttachments.length > 0 && (
        <div className="detail-gallery">
          <div className="gallery-main">
            <img
              src={getAttachmentUrl(
                attrs.objectid,
                imageAttachments[currentImageIdx].id,
              )}
              alt={imageAttachments[currentImageIdx].name}
              className="gallery-image"
              loading="lazy"
            />
            {imageAttachments.length > 1 && (
              <>
                <button
                  className="gallery-nav gallery-prev"
                  onClick={handlePrev}
                >
                  ‹
                </button>
                <button
                  className="gallery-nav gallery-next"
                  onClick={handleNext}
                >
                  ›
                </button>
              </>
            )}
          </div>
          {imageAttachments.length > 1 && (
            <div className="gallery-dots">
              {imageAttachments.map((_, i) => (
                <span
                  key={i}
                  className={`gallery-dot ${i === currentImageIdx ? "active" : ""}`}
                  onClick={() => setCurrentImageIdx(i)}
                />
              ))}
            </div>
          )}
          <div className="gallery-thumbs">
            {imageAttachments.map((att, i) => (
              <img
                key={att.id}
                src={getAttachmentUrl(attrs.objectid, att.id)}
                alt={att.name}
                className={`gallery-thumb ${i === currentImageIdx ? "active" : ""}`}
                onClick={() => setCurrentImageIdx(i)}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      {/* Video link */}
      {attrs.video && (
        <div className="detail-video">
          {attrs.video.split(";").map((url, i) => {
            const trimmed = url.trim();
            if (!trimmed) return null;
            return (
              <a
                key={i}
                href={trimmed}
                target="_blank"
                rel="noopener noreferrer"
                className="video-link"
              >
                🎬 Ver vídeo{" "}
                {attrs.video!.split(";").filter((u) => u.trim()).length > 1
                  ? i + 1
                  : ""}
              </a>
            );
          })}
        </div>
      )}
    </aside>
  );
}
