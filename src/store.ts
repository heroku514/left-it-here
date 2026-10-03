import AsyncStorage from "@react-native-async-storage/async-storage";
import { parsePlaces, type SavedPlaces } from "./places";

const KEY = "left-it-here-v1";

export async function loadPlaces(): Promise<SavedPlaces> {
  const raw = await AsyncStorage.getItem(KEY);
  return parsePlaces(raw);
}

export async function savePlaces(saved: SavedPlaces): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(saved));
}
