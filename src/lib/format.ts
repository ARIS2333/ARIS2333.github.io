const monthYear = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const newsDate = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonthYear(date: Date) {
  return monthYear.format(date);
}

export function formatNewsDate(date: Date) {
  return newsDate.format(date);
}

export function formatISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatRange(start: Date, end?: Date) {
  return `${formatMonthYear(start)} – ${end ? formatMonthYear(end) : "Present"}`;
}

export function paragraphs(text: string) {
  return text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
