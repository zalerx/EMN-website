// Slug generation: lowercase, hyphenated, ASCII-ish. Collision handling
// lives in makeUniqueSlug so the caller decides where "taken" comes from.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics left by NFKD
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function makeUniqueSlug(base: string, taken: string[]): string {
  const fallback = base || "article";
  const takenSet = new Set(taken);
  if (!takenSet.has(fallback)) return fallback;
  let n = 2;
  while (takenSet.has(`${fallback}-${n}`)) n++;
  return `${fallback}-${n}`;
}
