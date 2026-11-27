import type { ImageMetadata } from "astro";

const images = import.meta.glob<ImageMetadata>(
  "../assets/photographs/*/*.{[jJ][pP][gG],[jJ][pP][eE][gG],[pP][nN][gG],[wW][eE][bB][pP],[gG][iI][fF],[aA][vV][iI][fF],[sS][vV][gG]}",
  { eager: true, import: "default" },
);

export type GalleryPhoto = {
  place: string;
  image: ImageMetadata;
  featured: boolean;
  score: number;
};

export type GalleryGroup = {
  place: string;
  photos: GalleryPhoto[];
};

function photoRank(file: string) {
  const base = file.replace(/\.[^.]+$/, "");
  const featured = base.toLowerCase().includes("featured");
  const match = base.match(/^(\d+)_(\d+)/);
  return {
    featured,
    index: match ? Number(match[1]) : Number.MAX_SAFE_INTEGER,
    score: match ? Number(match[2]) : 0,
  };
}

function comparePhotos(aPath: string, bPath: string) {
  const [, , , aPlace, aFile] = aPath.split("/");
  const [, , , bPlace, bFile] = bPath.split("/");
  const a = photoRank(aFile);
  const b = photoRank(bFile);
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  const byPlace = aPlace.localeCompare(bPlace, "en");
  if (byPlace !== 0) return byPlace;
  if (a.score !== b.score) return b.score - a.score;
  return a.index - b.index;
}

export function getGalleryPhotos(): GalleryPhoto[] {
  return Object.keys(images)
    .sort(comparePhotos)
    .map((path) => {
      const [, , , place, file] = path.split("/");
      const rank = photoRank(file);
      return { place, image: images[path], featured: rank.featured, score: rank.score };
    });
}

export function getFeaturedPhotos(photos = getGalleryPhotos()) {
  return photos.filter((photo) => photo.featured);
}

export function getGalleryGroups(photos = getGalleryPhotos()): GalleryGroup[] {
  const groups = new Map<string, GalleryPhoto[]>();
  for (const photo of photos) {
    const current = groups.get(photo.place);
    if (current) current.push(photo);
    else groups.set(photo.place, [photo]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en"))
    .map(([place, group]) => ({ place, photos: group }));
}
