import { useI18n } from "../i18n.jsx";
import { HeroSlide } from "../components/HeroSlide.jsx";
import { WS } from "../components/WorkSlide.jsx";
import { Plus } from "../components/icons/Icons.jsx";

export const EMPTY_WORK = {
  title: "",
  en: "",
  price: 0,
  soldOut: false,
  image: "",
  cat: "",
  desc: "",
  descEn: "",
  dim: "",
  dimEn: "",
  material: "",
  materialEn: "",
  weight: "",
  weightEn: "",
  gallery: [],
};

/**
 * HomePage — the vertical reading journey (site landing):
 *   Hero (frontispiece) → WorkSlides → end marker.
 *
 * Purely presentational; state lives in NectarApp.jsx.
 */
export function HomePage({
  works,
  admin,
  onOpenEditor,
  onDeleteWork,
  onUploadCover,
  onOpenDetail,
}) {
  const { t } = useI18n();
  const featuredWorks = works.slice(0, 6);

  return (
    <div>
      {admin && (
        <div className="fab-add" style={{ position: "fixed", zIndex: 40 }}>
          <button
            onClick={() => onOpenEditor({ ...EMPTY_WORK })}
            style={{
              background: "#C9A96E",
              color: "#080706",
              border: "none",
              width: 50,
              height: 50,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 8px 40px rgba(201,169,110,0.3)",
            }}
          >
            <Plus s={22} />
          </button>
        </div>
      )}

      <HeroSlide />
      {featuredWorks.map((w, i) => (
        <WS
          key={w.id}
          work={w}
          index={i}
          total={featuredWorks.length}
          admin={admin}
          onEdit={onOpenEditor}
          onDelete={onDeleteWork}
          onUpload={onUploadCover}
          onOpen={onOpenDetail}
        />
      ))}

      <div
        className="home-end"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 1,
            height: 48,
            background:
              "linear-gradient(180deg, rgba(201,169,110,0.35), transparent)",
          }}
        />
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 13,
            fontStyle: "italic",
            letterSpacing: "0.22em",
            color: "rgba(212,184,122,0.72)",
            textShadow: "0 1px 16px rgba(0,0,0,0.45)",
          }}
        >
          {t("portfolioEnd")}
        </div>
      </div>
    </div>
  );
}
