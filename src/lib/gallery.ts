import type { ImageMetadata } from "astro";

const images = import.meta.glob<ImageMetadata>(
  "../assets/photographs/*/*.{[jJ][pP][gG],[jJ][pP][eE][gG],[pP][nN][gG],[wW][eE][bB][pP],[gG][iI][fF],[aA][vV][iI][fF],[sS][vV][gG]}",
  { eager: true, import: "default" },
);

export type GalleryPhoto = {
  place: string;
  image: ImageMetadata;
  featured: boolean;
};

export type GalleryGroup = {
  place: string;
  photos: GalleryPhoto[];
};

export function getGalleryPhotos(): GalleryPhoto[] {
  return Object.keys(images)
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((path) => {
      const [, , , place, file] = path.split("/");
      return { place, image: images[path], featured: file.toLowerCase().includes("featured") };
    });
}

export function getFeaturedPhotos(photos = getGalleryPhotos()) {
  return photos.filter((photo) => photo.featured);
}

export function getGalleryGroups(photos = getGalleryPhotos()): GalleryGroup[] {
  const groups: GalleryGroup[] = [];
  for (const photo of photos) {
    const current = groups.at(-1);
    if (current?.place === photo.place) current.photos.push(photo);
    else groups.push({ place: photo.place, photos: [photo] });
  }
  return groups;
}
