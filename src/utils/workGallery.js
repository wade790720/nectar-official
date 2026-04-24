/** 收集一件作品會佔用的所有圖 URL（主圖 + gallery） */
export function collectWorkImageRefs(work) {
  if (!work) return [];
  const out = [];
  if (work.image) out.push(work.image);
  for (const g of work.gallery || []) if (g) out.push(g);
  return out;
}

/** 比較兩個字串陣列（或單張 URL），回傳只存在於 before 的項目 */
export function diffImageRefs(before, after) {
  const beforeList = Array.isArray(before) ? before : before ? [before] : [];
  const afterSet = new Set(
    (Array.isArray(after) ? after : after ? [after] : []).filter(Boolean),
  );
  return beforeList.filter((u) => u && !afterSet.has(u));
}

/** 依縮圖列索引刪除：0=主圖（會由圖庫第一張遞補，無則清空） */
export function removeWorkImageAtThumbIndex(work, thumbIdx) {
  const g = [...(work.gallery || [])];
  const hasMain = !!work.image;
  if (hasMain) {
    if (thumbIdx === 0) {
      const nextMain = g.length > 0 ? g[0] : "";
      const nextGallery = g.slice(1);
      return { ...work, image: nextMain, gallery: nextGallery };
    }
    const gi = thumbIdx - 1;
    if (gi >= 0 && gi < g.length) {
      return { ...work, gallery: g.filter((_, j) => j !== gi) };
    }
    return work;
  }
  if (thumbIdx >= 0 && thumbIdx < g.length) {
    return { ...work, gallery: g.filter((_, j) => j !== thumbIdx) };
  }
  return work;
}
