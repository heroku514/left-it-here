import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Keyboard, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  cleared,
  hasAnyPlace,
  moveThing,
  placeAt,
  savePlace,
  selectThing,
  THINGS,
  thingAt,
  type SavedPlaces,
} from "./src/places";
import { loadPlaces, savePlaces } from "./src/store";

type Tab = "write" | "look";

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("write");
  const [saved, setSaved] = useState<SavedPlaces | null>(null);
  const [note, setNote] = useState("Pick a thing.");
  const [draft, setDraft] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    loadPlaces()
      .then((places) => {
        setSaved(places);
        setNote(hasAnyPlace(places) ? "Saved places loaded." : "Pick a thing.");
      })
      .catch(() => {
        setSaved(null);
        setNote("Could not read the saved places.");
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !saved) return;
    savePlaces(saved).catch(() => setNote("Could not save the places."));
  }, [ready, saved]);

  if (!ready || !saved) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <Text style={styles.loading}>Loading the places</Text>
        </View>
      </SafeAreaView>
    );
  }

  const thing = thingAt(saved);
  const place = placeAt(saved);

  function onSave() {
    Keyboard.dismiss();
    const result = savePlace(saved!, draft);
    setSaved(result.saved);
    setNote(result.note);
    if (result.note === "Place saved.") setDraft("");
    setConfirmClear(false);
  }

  function onSelect(index: number) {
    const result = selectThing(saved!, index);
    setSaved(result.saved);
    setNote(result.note);
    setDraft("");
    setConfirmClear(false);
  }

  function onMove(delta: -1 | 1) {
    const result = moveThing(saved!, delta);
    setSaved(result.saved);
    setNote(result.note);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.body}>
        <Text style={styles.title}>Left It Here</Text>
        <Text style={styles.note}>{note}</Text>
        {tab === "write" ? (
          <View style={styles.panel}>
            <Text style={styles.thing}>{thing.name}</Text>
            <Text style={styles.place}>{place || "Not written yet."}</Text>
            <Text style={styles.note}>{draft.trim() ? draft.trim() : "Nothing typed yet."}</Text>
            <BigButton label="Save place" filled onPress={onSave} />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              accessibilityLabel="Where it is"
              placeholder="Type a place"
              placeholderTextColor="#5E6B62"
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="words"
              style={styles.input}
            />
            <View style={styles.row}>
              {THINGS.slice(0, 3).map((item, index) => (
                <BigButton key={item.id} label={item.name} inRow filled={index === saved.current} onPress={() => onSelect(index)} />
              ))}
            </View>
            <View style={styles.row}>
              {THINGS.slice(3).map((item, index) => (
                <BigButton
                  key={item.id}
                  label={item.name}
                  inRow
                  filled={index + 3 === saved.current}
                  onPress={() => onSelect(index + 3)}
                />
              ))}
            </View>
            {confirmClear ? (
              <View style={styles.row}>
                <BigButton label="Confirm clear" filled inRow onPress={onConfirmClear} />
                <BigButton label="Cancel clear" inRow onPress={onCancelClear} />
              </View>
            ) : (
              <BigButton label="Clear place" onPress={() => setConfirmClear(true)} />
            )}
          </View>
        ) : (
          <View style={styles.panel}>
            <Text style={styles.thing}>{thing.name}</Text>
            <Text style={styles.look}>{place || "Not written yet."}</Text>
            <View style={styles.row}>
              <BigButton label="Previous thing" inRow onPress={() => onMove(-1)} />
              <BigButton label="Next thing" inRow onPress={() => onMove(1)} />
            </View>
          </View>
        )}
      </View>
      <View style={styles.tabs}>
        <TabButton label="Write" selected={tab === "write"} onPress={() => { setTab("write"); setConfirmClear(false); }} />
        <TabButton label="Look" selected={tab === "look"} onPress={() => { setTab("look"); setConfirmClear(false); }} />
      </View>
    </SafeAreaView>
  );

  function onConfirmClear() {
    setSaved(cleared(saved!));
    setConfirmClear(false);
    setNote("Place cleared.");
  }

  function onCancelClear() {
    setConfirmClear(false);
    setNote("Clear canceled.");
  }
}

function BigButton({
  label,
  onPress,
  filled,
  inRow,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
  inRow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, inRow && styles.buttonRow, filled && styles.buttonFilled]}
    >
      <Text style={[styles.buttonText, filled && styles.buttonTextFilled]}>{label}</Text>
    </Pressable>
  );
}

function TabButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tab, selected && styles.tabOn]}
    >
      <Text style={[styles.tabText, selected && styles.tabTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F7F2" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { fontSize: 28, fontWeight: "800", color: "#14241C" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 32, fontWeight: "800", color: "#14241C" },
  note: { fontSize: 18, color: "#3E5248", minHeight: 28, marginTop: 4 },
  panel: { flex: 1, gap: 8, marginTop: 8 },
  thing: { fontSize: 28, fontWeight: "800", color: "#14241C" },
  place: { fontSize: 26, fontWeight: "800", color: "#166534" },
  look: { fontSize: 40, fontWeight: "800", color: "#166534", lineHeight: 48 },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D5E4D8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 20,
    color: "#14241C",
  },
  row: { flexDirection: "row", gap: 8 },
  button: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  buttonRow: { flex: 1 },
  buttonFilled: { backgroundColor: "#166534" },
  buttonText: { fontSize: 16, fontWeight: "800", color: "#166534", textAlign: "center" },
  buttonTextFilled: { color: "#FFFFFF" },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#D5E4D8",
  },
  tab: { flex: 1, minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#E3EEE6" },
  tabOn: { backgroundColor: "#14241C" },
  tabText: { fontSize: 18, fontWeight: "800", color: "#14241C" },
  tabTextOn: { color: "#F3F7F2" },
});
