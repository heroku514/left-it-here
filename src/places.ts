export const THINGS = [
  { id: "keys", name: "Keys" },
  { id: "glasses", name: "Glasses" },
  { id: "remote", name: "Remote" },
  { id: "wallet", name: "Wallet" },
  { id: "cane", name: "Cane" },
  { id: "book", name: "Book" },
] as const;

export type ThingId = (typeof THINGS)[number]["id"];

export type SavedPlaces = {
  current: number;
  places: Record<ThingId, string>;
};

export const EMPTY_PLACES: SavedPlaces = {
  current: 0,
  places: { keys: "", glasses: "", remote: "", wallet: "", cane: "", book: "" },
};

export function thingAt(saved: SavedPlaces) {
  const index = saved.current >= 0 && saved.current < THINGS.length ? saved.current : 0;
  return THINGS[index];
}

export function placeAt(saved: SavedPlaces): string {
  return saved.places[thingAt(saved).id] || "";
}

export function hasAnyPlace(saved: SavedPlaces): boolean {
  return THINGS.some((thing) => saved.places[thing.id].trim().length > 0);
}

export function parsePlaces(raw: string | null): SavedPlaces {
  if (!raw) return EMPTY_PLACES;
  try {
    const data = JSON.parse(raw) as Partial<SavedPlaces>;
    const places = { ...EMPTY_PLACES.places };
    if (data.places && typeof data.places === "object") {
      for (const thing of THINGS) {
        const value = data.places[thing.id];
        if (typeof value === "string") places[thing.id] = value;
      }
    }
    const current = typeof data.current === "number" && data.current >= 0 && data.current < THINGS.length ? data.current : 0;
    return { current, places };
  } catch {
    return EMPTY_PLACES;
  }
}

export function selectThing(saved: SavedPlaces, index: number): { saved: SavedPlaces; note: string } {
  const thing = THINGS[index];
  return { saved: { ...saved, current: index }, note: `${thing.name}.` };
}

export function moveThing(saved: SavedPlaces, delta: -1 | 1): { saved: SavedPlaces; note: string } {
  if (delta < 0 && saved.current === 0) return { saved, note: "This is the first thing." };
  if (delta > 0 && saved.current === THINGS.length - 1) return { saved, note: "This is the last thing." };
  const current = saved.current + delta;
  return { saved: { ...saved, current }, note: `${THINGS[current].name}.` };
}

export function savePlace(saved: SavedPlaces, raw: string): { saved: SavedPlaces; note: string } {
  const place = raw.trim().replace(/\s+/g, " ");
  if (!place) return { saved, note: "Type a place first." };
  if (place.length > 40) return { saved, note: "Use a shorter place." };
  const thing = thingAt(saved);
  if (saved.places[thing.id].toLowerCase() === place.toLowerCase()) return { saved, note: "Already that place." };
  return {
    saved: { ...saved, places: { ...saved.places, [thing.id]: place } },
    note: "Place saved.",
  };
}

export function cleared(saved: SavedPlaces): SavedPlaces {
  const thing = thingAt(saved);
  return { ...saved, places: { ...saved.places, [thing.id]: "" } };
}
