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
