import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Editorial confirm dialog.
 *
 * Why not `window.confirm`?
 *   Chrome (and other browsers) will show a "Prevent this page from creating
 *   additional dialogs" checkbox after repeated prompts. Once a user checks
 *   it, every subsequent `window.confirm` silently returns `false` — or, in
 *   some codepaths, is treated as accepted — making destructive actions
 *   feel un-guarded. An in-app dialog is immune to that suppression and
 *   keeps the visual language consistent with the site.
 *
 * Usage:
 *   const confirm = useConfirm();
 *   const ok = await confirm({ message: "Delete?", tone: "danger" });
 *   if (!ok) return;
 *
 * Wrap the app once with <ConfirmProvider>.
 */

const ConfirmCtx = createContext(null);

export function useConfirm() {
  const fn = useContext(ConfirmCtx);
  if (!fn) {
    /** Fallback so callers never silently drop the guard if the provider
     *  is missing for some reason. */
    return (opts) => {
      const msg = typeof opts === "string" ? opts : opts?.message || "";
      return Promise.resolve(window.confirm(msg));
    };
  }
  return fn;
}

export function ConfirmProvider({ children }) {
  const [req, setReq] = useState(null);
  const reqRef = useRef(null);
  reqRef.current = req;

  const confirm = useCallback((input) => {
    const options =
      typeof input === "string" ? { message: input } : { ...(input || {}) };
    return new Promise((resolve) => {
      setReq({ options, resolve });
    });
  }, []);

  const close = useCallback((value) => {
    const current = reqRef.current;
    if (current) {
      current.resolve(value);
    }
    setReq(null);
  }, []);

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={!!req}
        options={req?.options}
        onConfirm={() => close(true)}
        onCancel={() => close(false)}
      />
    </ConfirmCtx.Provider>
  );
}

function ConfirmDialog({ open, options, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const opts = options || {};
  const tone = opts.tone === "danger" ? "danger" : "default";
  const title = opts.title;
  const message = opts.message || "";
  const confirmLabel = opts.confirmLabel || "Confirm";
  const cancelLabel = opts.cancelLabel || "Cancel";

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    const focusId = window.setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 40);
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(focusId);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (prev && typeof prev.focus === "function") prev.focus();
    };
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="cd-root"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="cd-backdrop" aria-hidden="true" />
      <div
        ref={dialogRef}
        className={`cd-dialog cd-tone-${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={title ? "cd-title" : undefined}
        aria-describedby="cd-message"
      >
        {title ? (
          <div id="cd-title" className="cd-title">
            {title}
          </div>
        ) : null}
        <p id="cd-message" className="cd-message">
          {message}
        </p>
        <div className="cd-actions">
          <button
            type="button"
            className="cd-btn cd-btn-cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className={`cd-btn cd-btn-confirm ${
              tone === "danger" ? "is-danger" : "is-primary"
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
