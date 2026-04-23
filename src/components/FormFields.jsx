export const lb = {
  display: "block",
  fontSize: 10,
  color: "rgba(201,169,110,0.3)",
  letterSpacing: "0.2em",
  marginBottom: 8,
  textTransform: "uppercase",
  fontFamily: "'Instrument Serif',serif",
  fontStyle: "italic",
};

export function Fld({ l, v, c, ph, tp }) {
  return (
    <div>
      <label style={lb}>{l}</label>
      <input
        className="fi"
        type={tp || "text"}
        value={v}
        onChange={(e) => c(e.target.value)}
        placeholder={ph || ""}
      />
    </div>
  );
}

export function FldArea({ l, v, c, ph, rows = 4 }) {
  return (
    <div>
      <label style={lb}>{l}</label>
      <textarea
        className="fi"
        rows={rows}
        value={v}
        onChange={(e) => c(e.target.value)}
        placeholder={ph || ""}
      />
    </div>
  );
}
