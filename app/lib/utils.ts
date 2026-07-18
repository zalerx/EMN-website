export function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(" ");
  }

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}