import { useMemo } from "react";
import { useI18n } from "../i18n.jsx";
import { Danmaku } from "../components/Danmaku.jsx";
import { VoteAdminRow } from "../components/VoteAdminRow.jsx";
import { Arr } from "../components/icons/Icons.jsx";

/**
 * VotePage — editorial pollbook.
 *
 * Structure:
 *   ① Header (eyebrow → title → sub)
 *   ② Leading panel (two-column, top-ranked option)
 *   ③ Index list (catalogue-style rows)
 *   ④ Admin editor (hidden unless signed in)
 *   ⑤ Wish pool (input + flowing italic quotes)
 *
 * Purely presentational; state lives in App (Portfolio.jsx).
 */
export function VotePage({
  votes,
  wishes,
  voted,
  voteFor,
  onVoteImg,
  onSaveNames,
  onToggleHidden,
  onDeleteOption,
  onAddOption,
  newlyAddedVoteId,
  onResetVotes,
  wiIn,
  onWiInChange,
  onSubmitWish,
  headerIn,
  cardsIn,
  admin,
}) {
  const { t, locale, flowerName } = useI18n();

  const publicVotes = useMemo(() => votes.filter((v) => !v.hidden), [votes]);
  const sorted = useMemo(
    () => [...publicVotes].sort((a, b) => b.votes - a.votes),
    [publicVotes],
  );
  const mx = useMemo(
    () => Math.max(1, ...publicVotes.map((f) => f.votes)),
    [publicVotes],
  );

  return (
    <div className="vp-page">
      <Danmaku wishes={wishes} />

      <header
        className="vp-head"
        style={{
          opacity: headerIn ? 1 : 0,
          transform: headerIn ? "translateY(0)" : "translateY(14px)",
          transition:
            "opacity 1s var(--ease-out-curve), transform 1s var(--ease-out-curve)",
        }}
      >
        <div className="vp-eyebrow">
          <span className="vp-eyebrow-rule" aria-hidden="true" />
          {t("voteKicker")}
        </div>
        <h2 className="vp-title">{t("voteTitle")}</h2>
        <p className="vp-sub">{t("voteSub")}</p>
      </header>

      {sorted[0]?.votes > 0 && (
        <section className="vp-leading">
          <div className="vp-leading-plate">
            {sorted[0].image ? (
              <img src={sorted[0].image} alt="" />
            ) : (
              <span className="vp-leading-emoji" aria-hidden="true">
                {sorted[0].emoji}
              </span>
            )}
          </div>
          <div className="vp-leading-body">
            <div className="vp-eyebrow">
              <span className="vp-eyebrow-rule" aria-hidden="true" />
              {t("voteLeading")}
            </div>
            <h3 className="vp-leading-name">{flowerName(sorted[0])}</h3>
            {(locale === "en" ? sorted[0].name : sorted[0].en) ? (
              <div className="vp-leading-alt">
                {locale === "en" ? sorted[0].name : sorted[0].en}
              </div>
            ) : null}
            <span className="vp-leading-rule" aria-hidden="true" />
            <div className="vp-leading-votes">
              <span className="vp-leading-votes-n">{sorted[0].votes}</span>
              <span className="vp-leading-votes-label">{t("voteVotes")}</span>
            </div>
          </div>
        </section>
      )}

      <div className="vp-list-kicker">{t("voteIndexKicker")}</div>
      <ol className="vp-list">
        {sorted.map((f, i) => {
          const altName = locale === "en" ? f.name : f.en;
          const ratio = mx > 0 ? f.votes / mx : 0;
          return (
            <li
              key={f.id}
              className={`vp-row ${voted[f.id] ? "is-voted" : ""}`}
              style={{
                opacity: cardsIn ? 1 : 0,
                transform: cardsIn ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 0.7s var(--ease-out-curve) ${i * 40}ms, transform 0.7s var(--ease-out-curve) ${i * 40}ms`,
              }}
            >
              <button
                type="button"
                className="vp-row-btn"
                onClick={() => voteFor(f.id)}
              >
                <span className="vp-row-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="vp-row-thumb">
                  {f.image ? (
                    <img src={f.image} alt="" />
                  ) : (
                    <span className="vp-row-emoji" aria-hidden="true">
                      {f.emoji}
                    </span>
                  )}
                </span>
                <span className="vp-row-names">
                  <span className="vp-row-name">{flowerName(f)}</span>
                  {altName ? (
                    <span className="vp-row-alt">{altName}</span>
                  ) : null}
                </span>
                <span className="vp-row-bar-wrap" aria-hidden="true">
                  <span className="vp-row-bar">
                    <span
                      className="vp-row-bar-fill"
                      style={{ "--vp-bar": ratio }}
                    />
                  </span>
                </span>
                <span className="vp-row-votes">
                  <span className="vp-row-votes-n">{f.votes}</span>
                  <span className="vp-row-votes-label">
                    {t("voteRowViewers")}
                  </span>
                  <span className="vp-row-tick">{t("voteVoted")}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {admin && (
        <section className="vp-admin">
          <div className="vp-admin-head">
            <div className="vp-admin-head-text">
              <h3 className="vp-admin-title">{t("voteEditOption")}</h3>
              <p className="vp-admin-sub">{t("voteCoursePhotosSub")}</p>
            </div>
            <button
              type="button"
              className="vp-admin-add"
              onClick={() => onAddOption?.()}
            >
              <span className="vp-admin-add-plus" aria-hidden="true">
                +
              </span>
              <span>{t("voteAddOption")}</span>
            </button>
          </div>
          <p className="vp-admin-hint">{t("voteAddOptionHint")}</p>
          <div className="vp-admin-grid">
            {votes.map((f) => (
              <VoteAdminRow
                key={f.id}
                item={f}
                t={t}
                autoFocus={f.id === newlyAddedVoteId}
                onSaveNames={onSaveNames}
                onToggleHidden={onToggleHidden}
                onDelete={onDeleteOption}
                onUploadImage={onVoteImg}
              />
            ))}
          </div>
        </section>
      )}

      <section className="vp-wish">
        <header className="vp-wish-head">
          <div className="vp-eyebrow">
            <span className="vp-eyebrow-rule" aria-hidden="true" />
            {t("wishKicker")}
          </div>
          <h3 className="vp-title" style={{ marginTop: 12 }}>
            {t("wishTitle")}
          </h3>
          <p className="vp-sub" style={{ marginTop: 10 }}>
            {t("wishSub")}
          </p>
        </header>

        <div className="vp-wish-bar">
          <input
            className="vp-wish-input"
            placeholder={t("wishPlaceholder")}
            value={wiIn}
            onChange={(e) => onWiInChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmitWish()}
            enterKeyHint="send"
            autoComplete="off"
          />
          <button
            type="button"
            className="vp-wish-send"
            onClick={onSubmitWish}
          >
            <span>{t("wishSend")}</span>
            <span aria-hidden="true">
              <Arr s={16} d="right" />
            </span>
          </button>
        </div>

        {wishes.length > 0 ? (
          <ul className="vp-wish-list">
            {wishes.slice(-30).map((w) => (
              <li key={w.id} className="vp-wish-item">
                {w.text}
              </li>
            ))}
          </ul>
        ) : (
          <div className="vp-wish-empty">{t("wishEmpty")}</div>
        )}

        {admin && (
          <div className="vp-admin-reset-wrap">
            <button
              type="button"
              className="vp-admin-reset"
              onClick={onResetVotes}
            >
              {t("wishReset")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
